/**
 * This module contains logic for watching key paths inside of objects.
 */

/***/

import {default as keyPath, toKeys, toKeyPath} from '../utils/key-path';
import {observe, unobserve} from './key';
import equals from '../utils/equals';

const callbacks: WeakMap<Object, {[path: string]: Set<Function>}> = new WeakMap();
const interceptors: WeakMap<Object, {[pathTo: string]: {[pathFrom: string]: Function}}> = new WeakMap();

/**
 * Watch a key path inside of an object and execute a given
 * callback when the value changes.
 * 
 * See [[mahalo#keyPath]] for more information about valid key paths.
 * 
 * @alias {watch} from mahalo
 */
export function watch(obj: Object, path: string, callback: Function) {
    let paths = callbacks.get(obj);
    
    if (!paths) {
        callbacks.set(obj, paths = {});
    }
    
    let callbacksForPath = paths[path];

    if (!paths.hasOwnProperty(path)) {
        callbacksForPath = paths[path] = new Set();
        
        watchKeys(obj, '', toKeys(path));
    }
    
    callbacksForPath.add(callback);
}

/**
 * Remove a callback for a key path, remove all callbacks for a key path
 * inside of an object or unwatch the object entirely.
 * 
 * See [[mahalo#keyPath]] for more information about valid key paths.
 * 
 * @alias {unwatch} from mahalo
 */
export function unwatch(obj: Object, path?: string, callback?: Function) {
    let map = callbacks.get(obj);
    
    if (!map) {
        return;
    }
    
    if (!path) {
        let paths = Object.keys(map);
        let i = paths.length;
        
        while (i--) {
            path = paths[i];
            unwatchKeys(obj, '', toKeys(path), obj);
        }
        
        callbacks.delete(obj);
        
        return;
    }
    
    if (!map.hasOwnProperty(path)) {
        return;
    }
    
    let callbacksForPath = map[path];
    
    callback && callbacksForPath.delete(callback);
    
    if (!callback || !callbacksForPath.size) {
        delete map[path];
        
        unwatchKeys(obj, '', toKeys(path), obj);
    }
    
    if (!Object.keys(map).length) {
        callbacks.delete(obj);
    }
}


//////////


/**
 * Recursively observes every key in a list of keys for a path.
 */
function watchKeys(obj: Object, pathTo: string, keys: string[]) {
    let key = keys.length ? keys.shift() : null;
    let value = !pathTo ? obj : keyPath(obj, pathTo);
    
    if (!(value instanceof Object)) {
        return;
    }
    
    pathTo = pathTo + (pathTo && key ? '.' : '') + (key === null ? '' : toKeyPath(key));
    
    let interceptor = getInterceptor(obj, pathTo, toKeyPath(keys));
    
    observe(value, key, interceptor);
    key && watchKeys(obj, pathTo, keys);
}

/**
 * Recursively unwobserves every key in a list of keys for a path.
 */
function unwatchKeys(obj: Object, pathTo: string, keys: string[], value) {
    let key = keys.length ? keys.shift() : null;
    
    if (!(value instanceof Object)) {
        return;
    }
    
    pathTo = pathTo + (pathTo && key ? '.' : '') + (key === null ? '' : toKeyPath(key));
    
    let interceptor = getInterceptor(obj, pathTo, toKeyPath(keys));
    
    unobserve(value, key, interceptor);
    key && unwatchKeys(obj, pathTo, keys, value[key]);
}

/**
 * Grabs the cached interceptor for a location inside of an object.
 */
function getInterceptor(obj: Object, pathTo: string, pathFrom: string) {
    let paths = interceptors.get(obj);
    
    if (!paths) {
        interceptors.set(obj, paths = {});
    }
    
    let pathsFrom = paths.hasOwnProperty(pathTo) ? paths[pathTo] : paths[pathTo] = {};
    
    return pathsFrom.hasOwnProperty(pathFrom) ? pathsFrom[pathFrom] : pathsFrom[pathFrom] = interceptor.bind(obj, pathTo, pathFrom);
}

/**
 * A callback that intercepts the change of an observed object's property
 * and executes the callbacks for changed values inside paths.
 */
function interceptor(pathTo: string, pathFrom: string, obj: Object, key: string, value) {
    let oldValue = !pathFrom || key === null ? value : keyPath(value, pathFrom.substr(key.length));
    let keys = toKeys(pathFrom);
    
    unwatchKeys(this, pathTo, keys.slice(), value);
    watchKeys(this, pathTo, keys);
    
    executeCallbacks(this, pathTo + (pathFrom ? '.' + pathFrom : ''), oldValue);
}

/**
 * Executes all callbacks for a path when the value at that path has changed.
 */
function executeCallbacks(obj: Object, path: string, oldValue) {
    let newValue = keyPath(obj, path);
    
    if (equals(newValue, oldValue)) {
        return;
    }
    
    let callbacksByPath = callbacks.get(obj);
    
    if (!callbacksByPath) {
        return;
    }
    
    let callbacksForPath = callbacksByPath[path];
    
    callbacksForPath && callbacksForPath.forEach(
        callback => callback(newValue, oldValue)
    );
}
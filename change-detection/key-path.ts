/**
 * This module contains logic for watching key paths inside of objects.
 */

/***/

import {default as keyPath, toKeys, toKeyPath} from '../utils/key-path';
import {observe, unobserve} from './key';
import equals from '../utils/equals';

/**
 * Watch a key path inside of an object and execute a given
 * callback when the value changes.
 * 
 * See [[mahalo#keyPath]] for more information about valid key paths.
 * 
 * @alias {watch} from mahalo
 */
export function watch(obj: Object, path: string, callback: Function) {
    var paths = callbacks.get(obj),
        callbacksForPath;
    
    if (!paths) {
        paths = {};
        callbacks.set(obj, paths);
    }
    
    if (!paths.hasOwnProperty(path)) {
        callbacksForPath = new Set();
        paths[path] = callbacksForPath;
        
        watchKeys(obj, '', toKeys(path));
    } else {
        callbacksForPath = paths[path];
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
    var map = callbacks.get(obj);
    
    if (!map) {
        return;
    }
    
    if (!path) {
        var paths = Object.keys(map),
            i = paths.length;
        
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
    
    var callbacksForPath;
    
    callbacksForPath = map[path];
    
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


var callbacks = new WeakMap(),
    interceptors = new WeakMap();

/**
 * Recursively observes every key in a list of keys for a path.
 */
function watchKeys(obj: Object, pathTo: string, keys: Array<string>) {
    var key = keys.length ? keys.shift() : null,
        value = !pathTo ? obj : keyPath(obj, pathTo),
        interceptor;
    
    if (!(value instanceof Object)) {
        return;
    }
    
    pathTo = pathTo + (pathTo && key ? '.' : '') + (key === null ? '' : toKeyPath(key));
    interceptor = getInterceptor(obj, pathTo, toKeyPath(keys));
    
    observe(value, key, interceptor);
    key && watchKeys(obj, pathTo, keys);
}

/**
 * Recursively unwobserves every key in a list of keys for a path.
 */
function unwatchKeys(obj: Object, pathTo: string, keys: Array<string>, value) {
    var key = keys.length ? keys.shift() : null,
        interceptor;
    
    if (!(value instanceof Object)) {
        return;
    }
    
    pathTo = pathTo + (pathTo && key ? '.' : '') + (key === null ? '' : toKeyPath(key));
    interceptor = getInterceptor(obj, pathTo, toKeyPath(keys));
    
    unobserve(value, key, interceptor);
    key && unwatchKeys(obj, pathTo, keys, value[key]);
}

/**
 * Grabs the cached interceptor for a location inside of an object.
 */
function getInterceptor(obj: Object, pathTo: string, pathFrom: string) {
    var paths = interceptors.get(obj);
    
    if (!paths) {
        interceptors.set(obj, paths = {});
    }
    
    paths = paths.hasOwnProperty(pathTo) ? paths[pathTo] : paths[pathTo] = {};
    
    return paths.hasOwnProperty(pathFrom) ? paths[pathFrom] : paths[pathFrom] = interceptor.bind(obj, pathTo, pathFrom);
}

/**
 * A callback that intercepts the change of an observed object's property
 * and executes the callbacks for changed values inside paths.
 */
function interceptor(pathTo: string, pathFrom: string, obj: Object, key: string, value) {
    var oldValue = !pathFrom || key === null ? value : keyPath(value, pathFrom.substr(key.length)),
        keys = toKeys(pathFrom);
    
    unwatchKeys(this, pathTo, keys.slice(), value);
    watchKeys(this, pathTo, keys);
    
    executeCallbacks(this, pathTo + (pathFrom ? '.' + pathFrom : ''), oldValue);
}

/**
 * Executes all callbacks for a path when the value at that path has changed.
 */
function executeCallbacks(obj: Object, path: string, oldValue) {
    var newValue = keyPath(obj, path);
    
    if (equals(newValue, oldValue)) {
        return;
    }
    
    var callbacksByPath = callbacks.get(obj);
    
    if (!callbacksByPath) {
        return;
    }
    
    var callbacksForPath = callbacksByPath[path];
    
    callbacksForPath && callbacksForPath.forEach(
        callback => callback(newValue, oldValue)
    );
}
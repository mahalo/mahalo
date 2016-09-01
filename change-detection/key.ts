/**
 * This module holds logic for observing keys of objects.
 */

/***/

import asap from '../utils/asap';
import clone from '../utils/clone';
import {default as Scope, getComponent} from '../app/scope';

const mutationKey = Symbol('mahalo-mutation-key');
const callbacksByKeys: WeakMap<Object, {[key: string]: Set<Function>}> = new WeakMap();
const computedKeys: Map<Object, {[key: string]: any}> = new Map();
const _defineProperty = Object.defineProperty;
const _defineProperties = Object.defineProperties;
const arrayPrototype = Array.prototype;
const methods = ['push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort'];

let counter = 0;
let scheduled;

/**
 * Makes sure a provided key is observed inside of an object and
 * adds a callback for that key.
 */
export function observe(obj: Object|Scope, key: string|number, callback: Function) {
    obj = obj instanceof Scope ? getComponent.call(obj, key) : obj;
    
    let keys = callbacksByKeys.get(obj);
    let use = key === null ? mutationKey : key;
    
    if (!keys) {
        keys = {};
        callbacksByKeys.set(obj, keys);
    }

    let callbacks = keys[use];

    if (!keys.hasOwnProperty(use)) {
        callbacks = new Set();
        keys[use] = callbacks;
    }
    
    key !== null && !callbacks.size && isComputed(obj, key) && observeComputed(obj, key);
    
    callbacks.add(callback);
}

/**
 * Removes a callback for a provided key from an object.
 */
export function unobserve(obj: Object, key: string|number, callback: Function) {
    obj = obj instanceof Scope ? getComponent.call(obj, key) : obj;
    
    let keys = callbacksByKeys.get(obj);
    let use = key === null ? mutationKey : key;
    
    if (!keys || !keys.hasOwnProperty(use)) {
        return;
    }
    
    let callbacks = keys[use];
    
    callbacks.delete(callback);
    
    key !== null && !callbacks.size && isComputed(obj, key) && unobserveComputed(obj, key);
}

/**
 * Execute all callbacks that were registered for a provided object
 * and key.
 */
export function executeCallbacks(obj: Object, key: string|number, oldValue) {
    let keys = callbacksByKeys.get(obj);
    let use = key === null ? mutationKey : key;
    let newValue = key === null ? obj : obj[key];
    
    if (!keys || !keys.hasOwnProperty(use) || newValue === oldValue) {
        return;
    }
    
    keys[use].forEach(callback => {
        callback(obj, key, oldValue);
    });
}

/**
 * Checks if an object is observed.
 */
export function hasCallbacks(obj) {
    return callbacksByKeys.has(obj);
}

/**
 * Schedules dirty checking of computed properties.
 */
export function scheduleCheck() {
    if (scheduled) {
        return;
    }
    
    scheduled = true;
    
    asap(checkComputed);
}

// Wrap array methods
methods.forEach(method => wrapMethod(method, arrayPrototype[method]));

// Wrap define methods
Object.defineProperty = defineProperty;
Object.defineProperties = defineProperties;


//////////


/**
 * Checks if a property is computed.
 */
function isComputed(obj: Object, key: string|number) {
    while (obj instanceof Object && !obj.hasOwnProperty(key)) {
        obj = Object.getPrototypeOf(obj);
    }
    
    let desc = Object.getOwnPropertyDescriptor(obj, key);
    
    return desc && desc.get ? true : false;
}

/**
 * Adds a computed key for beeing dirty checked.
 */
function observeComputed(obj: Object, key: string|number) {
    let map = computedKeys.get(obj);
    
    if (!map) {
        computedKeys.set(obj, map = {});
    }
    
    map[key] = obj[key];
}

/**
 * Removes a computed key from beeing dirty checked.
 */
function unobserveComputed(obj: Object, key: string|number) {
    let map = computedKeys.get(obj);
    
    if (!map) {
        return;
    }
    
    delete map[key];
    
    if (!Object.keys(map).length) {
        computedKeys.delete(obj);
    }
}

/**
 * Dirty checks if computed properties have changed.
 */
function checkComputed() {
    scheduled = false;
    
    computedKeys.forEach((map, obj) => {
        let oldObj = clone(obj);
        let keys = Object.keys(map);
        let i = keys.length;
        
        while (i--) {
            let key = keys[i];
            let newValue = obj[key];
            let oldValue = map[key];
            
            if (newValue !== oldValue) {
                map[key] = newValue;
                Object.defineProperty(oldObj, key, {value: oldValue});
                executeCallbacks(obj, key, oldValue);
            }
        }
        
        executeCallbacks(obj, null, oldObj);
    });
    
    if (scheduled) {
        if (counter++ > 10) {
            console.error('Mahalo Error: Too many update cycles');
        }
    } else {
        counter = 0;
    }
}

/**
 * A helper function that wraps native mutation methods
 * of arrays.
 */
function wrapMethod(name: string, method: Function) {
    _defineProperty(arrayPrototype, name, {
        value() {
            if (!callbacksByKeys.has(this)) {
                return method.apply(this, arguments);
            }

            let before = this.slice();
            let result = method.apply(this, arguments);
            
            arrayChanges(this, before);

            return result;
        }
    });
}

/**
 * A wrapper for Object's native defineProperty method.
 */
function defineProperty(obj: Object, key: string|number, desc: PropertyDescriptor) {
    let oldValue = obj[key];
    let oldObj = clone(obj);
    let result = _defineProperty(obj, key, desc);
    
    if (callbacksByKeys.has(obj)) {
        executeCallbacks(obj, key, oldValue);
        executeCallbacks(obj, null, oldObj);
    }
    
    return result;
}

/**
 * A wrapper for Object's native defineProperties method.
 */
function defineProperties(obj: Object, map: PropertyDescriptorMap) {
    let oldObj = clone(obj);
    let result = _defineProperties(obj, map);
    
    if (!callbacksByKeys.has(obj)) {
        return result;
    }
    
    let	keys = Object.keys(map);
    let i = keys.length;
    
    while (i--) {
        let key = keys[i];
        
        if (obj[key] !== map[key].value) {
            executeCallbacks(obj, key, oldObj[key]);
        }
    }
    
    executeCallbacks(obj, null, oldObj);
    
    return result;
}

/**
 * Executes callbacks for changes to arrays made
 * by the mutation methods of Array's prototype.
 */
function arrayChanges(arr: any[], oldArr: any[]) {
    let val = arr[0];
    let len = oldArr.length;
    let i = 0;

    while (val) {
        if (i >= len || val !== oldArr[i]) {
            executeCallbacks(arr, i, oldArr[i])
        }
        
        val = arr[++i];
    }

    if (arr.length !== len) {
        val = oldArr[i];

        while (val) {
            executeCallbacks(arr, i, val);
            val = oldArr[++i];
        }
        
        executeCallbacks(arr, 'length', len);
    }
    
    executeCallbacks(arr, null, oldArr);
}
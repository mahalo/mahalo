/**
 * 
 */

/***/

import asap from '../utils/asap';
import clone from '../utils/clone';
import {default as Scope, getComponent} from '../app/scope';

/**
 * 
 */
export function observe(obj: Object|Scope, key: string|number, callback: Function) {
    obj = obj instanceof Scope ? getComponent.call(obj, key) : obj;
    
    var keys = callbacksByKeys.get(obj),
        callbacks;
    
    if (!keys) {
        keys = {};
        callbacksByKeys.set(obj, keys);
    }
    
    if (!keys.hasOwnProperty(key)) {
        callbacks = new Set();
        keys[key] = callbacks;
    } else {
        callbacks = keys[key];
    }
    
    key && !callbacks.size && isComputed(obj, key) && observeComputed(obj, key);
    
    callbacks.add(callback);
}

/**
 * 
 */
export function unobserve(obj: Object, key: string|number, callback: Function) {
    obj = obj instanceof Scope ? getComponent.call(obj, key) : obj;
    
    var keys = callbacksByKeys.get(obj),
        callbacks;
    
    if (!keys || !keys.hasOwnProperty(key)) {
        return;
    }
    
    callbacks = keys[key];
    
    callbacks.delete(callback);
    
    key !== '' && !callbacks.size && isComputed(obj, key) && unobserveComputed(obj, key);
}

/**
 * 
 */
export function executeCallbacks(obj: Object, key: string|number, oldValue) {
    // asap(() => {
        var keys = callbacksByKeys.get(obj),
            newValue = obj[key];
        
        if (!keys || !keys.hasOwnProperty(key) || newValue === oldValue) {
            return;
        }
        
        keys[key].forEach(callback => {
            callback(obj, key, oldValue);
        });
    // });
}

/**
 * 
 */
export function hasCallbacks(obj) {
    return callbacksByKeys.has(obj);
}

/**
 * 
 */
export function scheduleCheck() {
    if (scheduled) {
        return;
    }
    
    scheduled = true;
    
    asap(checkComputed);
}


//////////


var callbacksByKeys = new WeakMap(),
    computedKeys = new Map(),
    _defineProperty = Object.defineProperty,
    _defineProperties = Object.defineProperties,
    arrayPrototype = Array.prototype,
    methods = ['push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort'],
    counter = 0,
    scheduled;

// Wrap array methods
methods.forEach(method => wrapMethod(method, arrayPrototype[method]));

// Wrap define methods
Object.defineProperty = defineProperty;
Object.defineProperties = defineProperties;

/**
 * 
 */
function isComputed(obj: Object, key: string|number) {
    while (obj instanceof Object && !obj.hasOwnProperty(key)) {
        obj = Object.getPrototypeOf(obj);
    }
    
    var desc = Object.getOwnPropertyDescriptor(obj, key);
    
    return desc && desc.get ? true : false;
}

/**
 * 
 */
function observeComputed(obj: Object, key: string|number) {
    var map = computedKeys.get(obj);
    
    if (!map) {
        map = {};
        computedKeys.set(obj, map);
    }
    
    map[key] = obj[key];
}

/**
 * 
 */
function unobserveComputed(obj: Object, key: string|number) {
    var map = computedKeys.get(obj);
    
    if (!map) {
        return;
    }
    
    delete map[key];
    
    if (!map.size) {
        computedKeys.delete(obj);
    }
}

/**
 * 
 */
function checkComputed() {
    scheduled = false;
    
    computedKeys.forEach((map, obj) => {
        var oldObj = clone(obj),
            keys = Object.keys(map),
            i = keys.length,
            newValue,
            oldValue,
            key;
        
        while (i--) {
            key = keys[i];
            newValue = obj[key],
            oldValue = map[key];
            
            if (newValue !== oldValue) {
                map[key] = newValue;
                Object.defineProperty(oldObj, key, {value: oldValue});
                executeCallbacks(obj, key, oldValue);
            }
        }
        
        executeCallbacks(obj, '', oldObj);
    });
    
    if (scheduled) {
        if (counter++ > 10) {
            console.error('Mahalo Error: Too many update cycles');
        }
    } else {
        counter = 0;
        // console.log('Mahalo Debug: ' + counter + ' update cycles run');
    }
}

/**
 * 
 */
function wrapMethod(name: string, method: Function) {
    _defineProperty(arrayPrototype, name, {
        value() {
            var result,
                before;
            
            if (callbacksByKeys.has(this)) {
                before = this.slice();
                result = method.apply(this, arguments);
                arrayChanges(this, before);
            } else {
                result = method.apply(this, arguments);
            }

            return result;
        }
    });
}

/**
 * 
 */
function defineProperty(obj: Object, key: string|number, desc: PropertyDescriptor) {
    var oldValue = obj[key],
        oldObj = clone(obj),
        result = _defineProperty(obj, key, desc);
    
    if (callbacksByKeys.has(obj)) {
        executeCallbacks(obj, key, oldValue);
        executeCallbacks(obj, '', oldObj);
    }
    
    return result;
}

/**
 * 
 */
function defineProperties(obj: Object, map: PropertyDescriptorMap) {
    var oldObj = clone(obj),
        result = _defineProperties(obj, map);
    
    if (!callbacksByKeys.has(obj)) {
        return result;
    }
    
    var	keys = Object.keys(map),
        i = keys.length,
        key;
    
    while (i--) {
        key = keys[i];
        
        if (obj[key] !== map[key].value) {
            executeCallbacks(obj, key, oldObj[key]);
        }
    }
    
    executeCallbacks(obj, '', oldObj);
    
    return result;
}

/**
 * 
 */
function arrayChanges(arr: Array<any>, oldArr: Array<any>) {
    var val = arr[0],
        i = 0,
        len = oldArr.length;

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
    
    executeCallbacks(arr, '', oldArr);
}
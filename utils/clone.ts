/**
 * 
 */

/***/

import {config} from '../index';

/**
 * 
 */
export default function clone(x) {
    // Not an object
    if (!(x instanceof Object)) {
        return x;
    }
    
    // Arraylike objects will be turned to arrays
    if (x instanceof NodeList || x instanceof HTMLCollection) {
        
    }
    
    // DOM Element
    if (x instanceof Node) {
        return x.cloneNode(true);
    }
    
    // Date
    if (x instanceof Date) {
        copy = new Date(x.getTime());
    }
    
    // RegExp
    if (x instanceof RegExp) {
        return new RegExp(x);
    }
    
    var copy;
    
    // Array
    if (Array.isArray(x)) {
        copy = [];
        
        x.forEach(value => copy.push(value === x ? copy : value));
        
        return copy;
    }
    
    // Function
    if (x instanceof Function) {
        var match = FN_NAME.exec(x),
            name = match ? match[1] : '';
        
        copy = Function('fn', 'return function ' + name + '() {\n\treturn fn.apply(this, arguments);\n}')(x);
        copy.prototype = x.prototype;
        
        return copy;
    }
    
    // Every other object
    return config.environment === 'development' ? tryCatch(x) : cloneObject(x);
}


//////////


var FN_NAME = /^function ([^(]*)/;

function tryCatch(x) {
    try {
        return cloneKeys(x);
    } catch (e) {
        return cloneObject(x);
    }
}

function cloneKeys(x) {
    var copy = create(Object.getPrototypeOf(x)),
        keys = Object.keys(x),
        len = keys.length,
        i = 0,
        key;
    
    while (i < len) {
        key = keys[i++];
        copy[key] = x[key] === x ? copy : x[key];
    }
    
    return copy;
}

export function create(prototype) {
    var Object,
        name;
    
    if (prototype.constructor instanceof Function) {
        name = (name = FN_NAME.exec(prototype.constructor)) ? name[1] : '';
        
        Object = Function('return function ' + name + '() {}')();
    } else {
        Object = function() {};
    }
    
    Object.prototype = prototype;
    
    return new Object();
}

function cloneObject(x) {
    return Object.assign(Object.create(Object.getPrototypeOf(x)), x);
}
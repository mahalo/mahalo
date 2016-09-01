/**
 * This module exports a utility function for cloning objects or other values.
 */

/***/

import {config} from '../index';

const matchFunctionName = /^function ([^(]*)/;

/**
 * Creates an exact clone of any value that can later be
 * checked for equality to its original by using [[mahalo/utils/equals.default]].
 */
export default function clone(x) {
    // Not an object
    if (!(x instanceof Object)) {
        return x;
    }
    
    // DOM Element
    if (x instanceof Node) {
        return x.cloneNode(true);
    }
    
    // Date
    if (x instanceof Date) {
        return new Date(x.getTime());
    }
    
    // RegExp
    if (x instanceof RegExp) {
        return new RegExp(x);
    }
    
    let copy;
    
    // Array
    if (Array.isArray(x)) {
        copy = [];
        
        x.forEach(value => copy.push(value === x ? copy : value));
        
        return copy;
    }
    
    // Function
    if (x instanceof Function) {
        let match = matchFunctionName.exec(x);
        let name = match ? match[1] : '';
        
        copy = Function('fn', 'return function ' + name + '() {\n\treturn fn.apply(this, arguments);\n}')(x);
        copy.prototype = x.prototype;
        
        return copy;
    }
    
    // Every other object
    return config.environment === 'development' ? tryCatch(x) : cloneObject(x);
}


//////////


function tryCatch(x) {
    try {
        return cloneKeys(x);
    } catch (e) {
        return cloneObject(x);
    }
}

function cloneKeys(x) {
    let copy = create(Object.getPrototypeOf(x));
    let keys = Object.keys(x);
    let len = keys.length;
    let i = 0;
    
    while (i < len) {
        let key = keys[i++];
        
        copy[key] = x[key] === x ? copy : x[key];
    }
    
    return copy;
}

export function create(prototype) {
    let Object;
    
    if (prototype.constructor instanceof Function) {
        let match = matchFunctionName.exec(prototype.constructor);
        
        Object = Function('return function ' + (match ? match[1] : '') + '() {}')();
    } else {
        Object = function() {};
    }
    
    Object.prototype = prototype;
    
    return new Object();
}

function cloneObject(x) {
    return Object.assign(Object.create(Object.getPrototypeOf(x)), x);
}
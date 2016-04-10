/**
 * This module is just in place as a workaround for Babel
 * not beeing able to call new ES2015 methods on arrays and
 * strings.
 * 
 * It it automatically injected into your code during transpilation
 * if an instance method is called that has one of the new names.
 * 
 * So no need to use this anywhere else in a Mahalo app.
 */

/// <reference path="./call-method.d.ts"/>

/**
 * Checks if the instance has a method at the given key that can be
 * used or falls back to Babel's polyfills in case the instance is
 * an array or a string.
 */
export default function callMethod(that, key, args) {
    var method = that[key],
        type = typeof method;
    
    if (type === 'undefined') {
        if (that instanceof Array) {
            return arrayMethods[key].apply(null, [that].concat(args));
        }
        
        if (typeof that === 'string') {
            return stringMethods[key].apply(null, [that].concat(args));
        }
    }
    
    return type === 'function' ? method.apply(that, args) : that[key]();
}


//////////


var arrayMethods = {
        copyWithin: Array.copyWithin,
        entries: Array.entries,
        fill: Array.fill,
        find: Array.find,
        findIndex: Array.findIndex,
        keys: Array.keys,
        values: Array.values
    },
    stringMethods = {
        codePointAt: String.codePointAt,
        endsWith: String.endsWith,
        includes: String.includes,
        repeat: String.repeat,
        startsWith: String.startsWith
    };
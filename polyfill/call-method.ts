/// <reference path="array.d.ts" />

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
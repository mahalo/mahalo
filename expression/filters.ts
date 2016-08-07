/**
 * This module exports the filters object.
 */

/***/

import {config} from '../index';

/**
 * This is the filters object that will be used to look
 * for filters in expressions. It's a plain JS object so
 * you can just import it, use its methods as you see fit,
 * add custom filters to it or even overwrite the default
 * ones.
 * 
 * @alias {filters} from mahalo
 */
export var filters = {
    lower: lower,
    upper: upper,
    camel: camel,
    hyphen: hyphen,
    underscore: underscore,
    pad: pad,
    date: date,
    number: number,
    filter: filter,
    sort: sort
}


//////////


var SEPARATOR = /^\d([^\d])/,
    DECIMAL_POINT = /^\d[^\d]?\d\d\d([^\d])/,
    PRECISION = /(\d*)$/;

/**
 * Converts a string to lower-case letters.
 */
function lower(value: string) {
    return (value + '').toUpperCase();
}

/**
 * Converts a string to upper-case letters.
 */
function upper(value: string) {
    return (value + '').toUpperCase();
}

/**
 * Converts a hyphenated or underscored string to camel-case.
 */
function camel(value: string, first?: boolean) {
    value = (value + '').replace(/[-_]([a-z])/g, (_, char) => {
        return char.toUpperCase();
    });
    
    if (first) {
        value = value[0].toUpperCase() + value.substr(1);
    }
    
    return value;
}

/**
 * Converts a camel-cased string to a hyphenated one.
 */
function hyphen(value: string) {
    value = (value + '').replace(/[A-Z]/g, m => {
        return '-' + m.toLowerCase();
    });
    
    return value[0] === '-' ? value.substr(1) : value;
}

/**
 * Converts a camel-cased string to a underscored one.
 */
function underscore(value: string) {
    value = (value + '').replace(/[A-Z]/g, m => {
        return '_' + m.toLowerCase();
    });
    
    return value[0] === '_' ? value.substr(1) : value;
}

/**
 * Pads a string on its left side with an optional given
 * character or 0.
 */
function pad(value: string|number, length: number, char: string = '0') {
    var str = value + '',
        i = 0;
    
    length -= str.length;
    
    while (i++ < length) {
        str = char + str;
    }
    
    return str;
}

/**
 * Converts a given value to a date in a givenformat or
 * the default one from the config.
 * 
 * Currently the following tokens are supported:
 * 
 * * D: 1 or 2 digit day of the month (1-31)
 * * DD: 2 digit day of the month (01-31)
 * * M: 1 or 2 digit month (1-12)
 * * MM: 2 digit month (01-12)
 * * YY: 2 digit year (00-99)
 * * YYYY: 4 digit year (0000-9999)
 * * h: Hour (1-12)
 * * hh: Hour (00-23)
 * * mm: Minutes (00-59)
 * * ss: Seconds (00-59)
 */
function date(value: string, format?: string) {
    var date = new Date(value);
    
    format = typeof format === 'string' ? format : config.dateFormat;
    
    return format.replace(/(M+|D+|Y+|h+|m+|s+)/ig, (m, token) => {
        switch (token) {
            case 'M':
                return date.getMonth() + 1 + '';
            
            case 'MM':
                return pad(date.getMonth() + 1, 2);
            
            case 'D':
                return date.getDate() + '';
            
            case 'DD':
                return pad(date.getDate(), 2);
            
            case 'YY':
                return date.getFullYear().toString().substr(2);
                
            case 'YYYY':
                return date.getFullYear() + '';
                
            case 'h':
                var hours = date.getHours();
                
                return hours === 0 ? '12' : pad(hours < 13 ? hours : hours - 12, 2);
                
            case 'hh':
                return pad(date.getHours(), 2);
            
            case 'mm':
                return pad(date.getMinutes(), 2);
            
            case 'ss':
                return pad(date.getSeconds(), 2);
        }
        
        return m;
    });
}

/**
 * Converts a value to number in a optionally give format or
 * the default one from the config.
 * 
 * The format will be parsed from one of the following or
 * fallback to an integer:
 * 
 * * 1000
 * * 1000.00
 * * 1,000.00
 * * 1.000,00
 * 
 * Basically the algorithm is to use any non numeric character
 * from the 2 position in the string as thousands separator if
 * available. The last non numeric character from the end will
 * be used the decimal point and the number of numeric characters
 * at the end of the string will be used as precision.
 */
function number(value, format?: string) {
    var match,
        separator,
        decimalPoint,
        precision;
    
    format = typeof format === 'string' ? format : config.numberFormat;
    
    match = SEPARATOR.exec(format);
    separator = match && match[1];
    
    match = DECIMAL_POINT.exec(format);
    decimalPoint = match && match[1];
    
    match = PRECISION.exec(format);
    precision = Math.pow(10, (match ? match[1] : '').length);
    
    value = Math.round(parseFloat(value) * precision) / precision;
    value = value.toString().split('.');
    
    if (separator) {
        var len = value[0].length,
            i = len % 3,
            full = value[0].substr(0, i);
        
        while (i + 3 <= len) {
            full += separator + value[0].substr(i, 3);
            i += 3;
        }
    } else {
        full = value[0];
    }
    
    return full + decimalPoint + (value[1] || '');
}

/**
 * Filters an array by a given value or undefined. If an optional key is
 * given as third argument it will try to use that key from
 * tha array's values.
 */
function filter(arr: Array<any>, value?: any, key?: string) {
    if (!(arr instanceof Array)) {
        return arr;
    }
    
    var byValue = typeof key !== 'string';
    
    return arr.filter(a => {
        var a = byValue ? a : a instanceof Object ? a[key] : void 0;
        
        return a == value;
    });
}

/**
 * Sorts an array. An optional key can be given as second parameter
 * that will be looked up on the array's values for comparison.
 * A third argument allows for changing the sort order to descending.
 */
function sort(arr: Array<any>, key?: string, desc?: boolean) {
    if (!(arr instanceof Array)) {
        return arr;
    }
    
    var copy = arr.slice(),
        asc = desc ? -1 : 1,
        byValue = typeof key !== 'string';
    
    copy.sort((a, b) => {
        a = byValue ? a : a instanceof Object ? a[key] : void 0,
        b = byValue ? b : b instanceof Object ? b[key] :  void 0;
        
        return a < b ? -1 * asc : a > b ? 1 * asc : 0;
    });
    
    return copy;
}
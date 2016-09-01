/**
 * This module exports the filters object.
 */

/***/

import {config} from '../index';

const matchSeparator = /^\d([^\d])/;
const matchDecimalPoint = /^\d[^\d]?\d\d\d([^\d])/;
const matchPrecision = /(\d*)$/;

/**
 * This is the filters object that will be used to look
 * for filters in expressions. It's a plain JS object so
 * you can just import it, use its methods as you see fit,
 * add custom filters to it or even overwrite the default
 * ones.
 * 
 * @alias {filters} from mahalo
 */
export const filters = {
    /**
     * Converts a string to lower-case letters.
     */
    lower(value: string) {
        return (value + '').toUpperCase();
    },

    /**
     * Converts a string to upper-case letters.
     */
    upper(value: string) {
        return (value + '').toUpperCase();
    },

    /**
     * Converts a hyphenated or underscored string to camel-case.
     */
    camel(value: string, first?: boolean) {
        value = (value + '').replace(/[-_]([a-z])/g, (_, char) => {
            return char.toUpperCase();
        });
        
        if (first) {
            value = value[0].toUpperCase() + value.substr(1);
        }
        
        return value;
    },

    /**
     * Converts a camel-cased string to a hyphenated one.
     */
    hyphen(value: string) {
        value = (value + '').replace(/[A-Z]/g, m => {
            return '-' + m.toLowerCase();
        });
        
        return value[0] === '-' ? value.substr(1) : value;
    },

    /**
     * Converts a camel-cased string to a underscored one.
     */
    underscore(value: string) {
        value = (value + '').replace(/[A-Z]/g, m => {
            return '_' + m.toLowerCase();
        });
        
        return value[0] === '_' ? value.substr(1) : value;
    },

    /**
     * Pads a string on its left side with an optional given
     * character or 0.
     */
    pad(value: string|number, length: number, char: string = '0') {
        value = value + '';
        length -= (<string>value).length;
        
        while (length--) {
            value = char + value;
        }
        
        return <string>value;
    },

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
    date(value: string, format?: string) {
        let date = new Date(value);
        
        format = typeof format === 'string' ? format : config.dateFormat;
        
        return format.replace(/(M+|D+|Y+|h+|m+|s+)/ig, (m, token) => {
            switch (token) {
                case 'M':
                    return date.getMonth() + 1 + '';
                
                case 'MM':
                    return filters.pad(date.getMonth() + 1, 2);
                
                case 'D':
                    return date.getDate() + '';
                
                case 'DD':
                    return filters.pad(date.getDate(), 2);
                
                case 'YY':
                    return date.getFullYear().toString().substr(2);
                    
                case 'YYYY':
                    return date.getFullYear() + '';
                    
                case 'h':
                    let hours = date.getHours();
                    
                    return hours === 0 ? '12' : filters.pad(hours < 13 ? hours : hours - 12, 2);
                    
                case 'hh':
                    return filters.pad(date.getHours(), 2);
                
                case 'mm':
                    return filters.pad(date.getMinutes(), 2);
                
                case 'ss':
                    return filters.pad(date.getSeconds(), 2);
            }
            
            return m;
        });
    },

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
    number(value, format?: string) {
        format = typeof format === 'string' ? format : config.numberFormat;
        
        let match = matchSeparator.exec(format);
        let separator = match && match[1];
        
        match = matchDecimalPoint.exec(format);
        let decimalPoint = match && match[1];
        
        match = matchPrecision.exec(format);
        let precision = Math.pow(10, (match ? match[1] : '').length);
        
        value = Math.round(parseFloat(value) * precision) / precision;
        value = value.toString().split('.');
        
        let full = value[0];

        if (separator) {
            let len = value[0].length;
            let i = len % 3;
            
            full = value[0].substr(0, i);
            
            while (i + 3 <= len) {
                full += separator + value[0].substr(i, 3);
                i += 3;
            }
        }
        
        return full + decimalPoint + (value[1] || '');
    },

    /**
     * Filters an array by a given value or undefined. If an optional key is
     * given as third argument it will try to use that key from
     * tha array's values.
     */
    filter(arr: any[], value?: any, key?: string) {
        if (!(arr instanceof Array)) {
            return arr;
        }
        
        let byValue = typeof key !== 'string';
        
        return arr.filter(a => {
            a = byValue ? a : a instanceof Object ? a[key] : void 0;
            
            return a == value;
        });
    },

    /**
     * Sorts an array. An optional key can be given as second parameter
     * that will be looked up on the array's values for comparison.
     * A third argument allows for changing the sort order to descending.
     */
    sort(arr: any[], key?: string, desc?: boolean) {
        if (!(arr instanceof Array)) {
            return arr;
        }
        
        let copy = arr.slice();
        let asc = desc ? -1 : 1;
        let byValue = typeof key !== 'string';
        
        copy.sort((a, b) => {
            a = byValue ? a : a instanceof Object ? a[key] : void 0,
            b = byValue ? b : b instanceof Object ? b[key] :  void 0;
            
            return a < b ? -1 * asc : a > b ? 1 * asc : 0;
        });
        
        return copy;
    }
}
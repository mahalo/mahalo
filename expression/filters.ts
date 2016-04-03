// @todo: Add more built-in filters

import config from '../config';

var SEPARATOR = /^\d([^\d])/,
    DECIMAL_POINT = /^\d[^\d]?\d\d\d([^\d])/,
    PRECISION = /(\d*)$/;

export default {
    lower: lower,
    upper: upper,
    camel: camel,
    pad: pad,
    date: date,
    number: number
}


//////////


function lower(value: string) {
    if (typeof value !== 'string') {
        return '';
    }
    
    return value.toUpperCase();
}

function upper(value: string) {
    if (typeof value !== 'string') {
        return '';
    }
    
    return value.toUpperCase();
}

function camel(value: string, first?: boolean) {
    if (typeof value !== 'string') {
        return '';
    }
    
    value = value.replace(/[-_]([a-z])/g, function(_, char) {
        return char.toUpperCase();
    });
    
    if (first) {
        value = value[0].toUpperCase() + value.substr(1);
    }
    
    return value;
}

function pad(value: string|number, length: number, char: string = '0') {
    var str = value + '',
        i = 0;
    
    length -= str.length;
    
    while (i++ < length) {
        str = char + str;
    }
    
    return str;
}

function date(value: string, format: string) {
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

function number(value, format: string = config.numberFormat) {
    var match,
        separator,
        decimalPoint,
        precision,
        pow;
    
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
import {default as Scope, getComponent} from '../app/scope';
import {assign} from '../mahalo';

export function toKeys(str: string) {
    var keys = [],
        key = '',
        char = str[0],
        i = 0,
        esc = false;

    while (char) {
        if (char === '^' && !esc) {
            esc = true;
        } else if (char === '.' && !esc) {
            keys.push(key);
            key = '';
            esc = false;
        } else {
            key += char;
            esc = false;
        }
        
        char = str[++i];
    }

    keys.push(key);

    return keys;
}

export function toKeyPath(keys: Array<string>|string) {
    var _keys = typeof keys === 'string' ? [keys] : keys,
        i = _keys.length;
    
    while (i--) {
        _keys[i] = _keys[i].replace('^', '^^').replace('.', '^.');
    }
    
    return _keys.join('.');
}

export default function keyPath(obj: Object, path: string, val?) {
    if (!(obj instanceof Object)) {
        return;
    }
    
    var keys = toKeys(path),
        key = keys[0],
        len = keys.length - 1,
        i = 0,
        args = arguments.length;

    while (i < len) {
        key = keys[i++];

        if (typeof obj[key] === 'undefined') {
            if (args < 3) {
                return;
            }

            obj[key] = {};
        }

        obj = obj[key];

        if (!(obj instanceof Object)) {
            return;
        }
    }
    
    key = keys[i];

    if (args > 2) {
        if (obj instanceof Scope) {
            obj = getComponent.call(obj, key);
        }
        
        return assign(obj, key, val);
    }

    return obj[key];
}
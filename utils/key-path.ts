/**
 * This module contains utility functions to deal with paths
 * inside of objects.
 */

/***/

import {default as Scope, getComponent} from '../app/scope';
import {assign} from '../index';

/**
 * Finds a value along a given path or sets a value in the given path
 * when called with a third argument.
 * 
 * A key path is a chain of keys to follow inside of an object. They are
 * separeted by a dot. If your key actually contains a dot you can
 * escape it with the **^** symbol. If you need an actual **^** symbol
 * in a key you can use **^^**. You get the idea.
 * 
 * @alias {keyPath} from mahalo
 */
export default function keyPath(obj: Object, path: string, val?) {
    if (!(obj instanceof Object)) {
        return;
    }
    
    let keys = toKeys(path);
    let key = keys[0];
    let len = keys.length - 1;
    let i = 0;
    let args = arguments.length;
    
    obj instanceof Scope && (obj = getComponent.call(obj, key));

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

        obj instanceof Scope && (obj = getComponent.call(obj, key));
    }
    
    key = keys[i];

    if (args > 2) {
        return assign(obj, key, val);
    }

    return obj[key];
}

/**
 * Parses a path string into an array of keys
 * for the given path.
 * 
 * ##### Example
 * 
 * ```javascript
 * toKeys('user.name'); // ['user', 'name']
 * toKeys('user^.name'); // ['user.name']
 * toKeys('user^^.name'); // ['user^', 'name']
 * ```
 */
export function toKeys(str: string) {
    let keys: string[] = [];
    let key = '';
    let char = str[0];
    let i = 0;
    let esc = false;

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

/**
 * Transforms either an array of keys or a single key into
 * a valid path with escaped dots.
 */
export function toKeyPath(keys: string[]|string) {
    let _keys = typeof keys === 'string' ? [keys] : keys;
    let len = _keys.length;
    
    while (len--) {
        _keys[len] = _keys[len].replace('^', '^^').replace('.', '^.');
    }
    
    return _keys.join('.');
}
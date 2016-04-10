/**
 * This module just installs a polyfill for Object.getPrototypeOf
 * if Object.setPrototypeOf is not available natively. This is
 * neccessary to make the Object.setPrototypeOf polyfill to work.
 */

/***/

if (!('setPrototypeOf' in Object || '__proto__' in {})) {
    var _getPrototypeOf = Object['getPrototypeOf'];
    
    Object.defineProperty(Object, 'getPrototypeOf', {
        enumerable: false,
        value(obj) {
            return '__proto__' in obj ? obj.__proto__ : _getPrototypeOf(obj);
        }
    });
}
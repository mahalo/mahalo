if (!('setPrototypeOf' in Object || '__proto__' in {})) {
    var _getPrototypeOf = Object['getPrototypeOf'];
    
    Object.defineProperty(Object, 'getPrototypeOf', {
        enumerable: false,
        value(obj) {
            return '__proto__' in obj ? obj.__proto__ : _getPrototypeOf(obj);
        }
    });
}
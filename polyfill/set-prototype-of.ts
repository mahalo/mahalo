/**
 * This module just installs a polyfill for Object.setPrototypeOf
 * if it is not available natively. If this is not done Babel
 * transpiled code will not work in IE<10 or PhantomJS.
 */

/***/

'setPrototypeOf' in Object || '__proto__' in {} ? installOther() : installIE();


//////////


/**
 * Installs the polyfill for non IE browsers that need it.
 */
function installOther() {
    Object.defineProperty(Object, 'setPrototypeOf', {
        enumerable: false,
        value: setPrototypeOf
    });


    //////////


    function setPrototypeOf(obj, parent) {
        obj.__proto__ = parent;
        
        return obj;
    }
}

/**
 * Installs the polyfill for IE.
 */
function installIE() {
    Object.defineProperty(Object, 'setPrototypeOf', {
        enumerable: false,
        value: setPrototypeOf
    });
    
    
    //////////
    
    
    var skip = ['length', 'name', 'arguments', 'caller', 'callee', 'prototype'];

    /**
     * Sets the prototype of an object.
     */
    function setPrototypeOf(obj, parent) {
        var keys = Object.getOwnPropertyNames(parent),
            key = keys[0],
            i = 0,
            proto,
            descriptor,
            parentDescriptor;
        
        if (!obj.hasOwnProperty('__proto__')) {
            Object.defineProperty(obj, '__proto__', {configurable: true, writable: true, value: parent});
        }
        
        while (key) {
            if (key === '__proto__') {
                proto = parent[key];
            } else if (skip.indexOf(key) < 0) {
                descriptor = Object.getOwnPropertyDescriptor(obj, key);
                
                if (!descriptor) {
                    parentDescriptor = Object.getOwnPropertyDescriptor(parent, key);
                    if (parentDescriptor && typeof parentDescriptor.get === 'function') {
                        console.log(key);
                        bindKey(obj, key, parentDescriptor);
                    } else if (typeof parent[key] === 'function') {
                        obj[key] = bindMethod(parent[key]);
                    } else {
                        bindKey(obj, key);
                    }
                }
            }
            
            key = keys[++i];
        }
        
        proto && setPrototypeOf(obj, proto);

        return obj;
    }
    
    /**
     * Creates a wrapper method that invokes the super method.
     */
    function bindMethod(method) {
        return () => {           
            return method.apply(this, arguments);
        }
    }
    
    /**
     * Creates a getter and setter for proxying to the super property.
     */
    function bindKey(obj, key: string|number, parentDescriptor?: PropertyDescriptor) {
        var defaultValue;
        
        if (!parentDescriptor) {
            defaultValue = obj.__proto__[key];
            
            parentDescriptor = {
                get: function() {
                    return obj['_$' + key] || defaultValue
                },
                set: function(value) {
                    obj['_$' + key] = value;
                }
            }
        }
        
        Object.defineProperty(obj, key, {
            get: parentDescriptor.get.bind(obj),
            set: parentDescriptor.set ? parentDescriptor.set.bind(obj) : undefined,
            configurable: true
        });
    }
}
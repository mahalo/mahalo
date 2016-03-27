'setPrototypeOf' in Object || polyfill();

function polyfill() {
	var skip = ['length', 'name', 'arguments', 'caller', 'prototype'];
	
	Object.defineProperty(Object, 'setPrototypeOf', {
		enumerable: false,
		value: setPrototypeOf
	});
	
	function setPrototypeOf(obj, parent) {
		var keys = Object.getOwnPropertyNames(parent),
			key = keys[0],
			i = 0,
			proto,
			descriptor,
			parentDescriptor;
		
		obj.hasOwnProperty('__proto__') || (obj.__proto__ = parent);
		
		while (key) {
			if (key === '__proto__') {
				proto = parent[key];
			} else if (skip.indexOf(key) < 0) {
				descriptor = Object.getOwnPropertyDescriptor(obj, key);
				
				if (!descriptor) {
					parentDescriptor = Object.getOwnPropertyDescriptor(parent, key);
					
					if (typeof parentDescriptor.get === 'function') {
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
	}
	
	function bindMethod(method) {
		return () => {
			return method.apply(this, arguments);
		}
	}
	
	function bindKey(obj, key: string|number, parentDescriptor?: PropertyDescriptor) {
		var defaultValue;
		
		if (!parentDescriptor) {
			defaultValue = obj.__proto__[key];
			
			parentDescriptor = {
				get: function() {
					return obj['__' + key] || defaultValue
				},
				set: function(value) {
					obj['__' + key] = value;
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
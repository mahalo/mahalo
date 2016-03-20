if (typeof Object.setPrototypeOf === 'undefined' && typeof Object.getOwnPropertyNames === 'function') {
	var _exclude = ['length', 'name', 'arguments', 'caller', 'prototype'];

	function bindFunction(subClass, superClass) {
		return function() {
			return superClass.apply(subClass, arguments);
		}
	}

	function bindProperty(subClass, key, superDesc) {
		if (!superDesc) {
			var defaultValue = subClass.__proto__[key];
			
			superDesc = {
				get: function () {
					return subClass['__' + key] || defaultValue;
				},
				set: function (value) {
					subClass['__' + key] = value;
				}
			}
		}
		
		Object.defineProperty(subClass, key, {
			configurable: true,
			get: superDesc.get.bind(subClass),
			set: superDesc.set ? superDesc.set.bind(subClass) : undefined
		});
	}

	function iterateProps(subClass, superClass) {
		var keys = Object.getOwnPropertyNames(superClass),
			key = keys[0],
			i = 0,
			proto,
			desc,
			superDesc;
		
		subClass.__proto__ = superClass;
		
		while (key) {
			if (key === '__proto__') {
				proto = superClass[key];
			} else if (_exclude.indexOf(key) < 0) {
				desc = Object.getOwnPropertyDescriptor(subClass, key);
				
				if (!desc) {
					superDesc = Object.getOwnPropertyDescriptor(superClass, key);
					
					if (typeof superDesc.get !== 'function' && typeof superClass[key] === 'function') {
						subClass[key] = bindFunction(subClass, superClass[key]);
					} else if (typeof superDesc.get === 'function') {
						bindProperty(subClass, key, superDesc);
					} else {
						bindProperty(subClass, key);
					}
				}
			}
			
			key = keys[++i];
		}
		
		if (proto) {
			iterateProps(subClass, proto);
		}
	}

	Object.setPrototypeOf = iterateProps;
}
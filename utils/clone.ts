var FN_NAME = /^function ([^(]*)/;

export default function clone(x) {
	// Not an object
	if (!(x instanceof Object)) {
		return x;
	}
	
	var copy;
	
	if (x instanceof Node) {
		// DOM Elements
		copy = x.cloneNode(true);
	} else if (x instanceof Date) {
		// Date
		copy = new Date(x.getTime());
	} else if (x instanceof RegExp) {
		// RegExp
		copy = new RegExp(x);
	} else if (Array.isArray(x)) {
		copy = x.slice(0, 0);
		
		x.forEach(function(value) {
			copy.push(value === x ? copy : value);
		});
	} else {
		var copy,
			key;
		
		if (x instanceof Function) {
			key = (key = FN_NAME.exec(x)) ? key[1] : '';
			copy = Function('fn', 'return function ' + key + '() {\n\treturn fn.apply(this, arguments);\n}')(x);
			copy.prototype = x.prototype;
		} else {
			copy = create(Object.getPrototypeOf(x));
		}
		
		for (key in x) {
			if (x.hasOwnProperty(key)) {
				copy[key] = x[key] === x ? copy : x[key];
			}
		}
	}
	
	return copy;
}

function create(prototype) {
	var Object,
        name;
	
	if (prototype.constructor instanceof Function) {
        name = (name = FN_NAME.exec(prototype.constructor)) ? name[1] : '';
		Object = Function('return function ' + name + '() {}')();
	} else {
		Object = function() {};
	}
	
	Object.prototype = prototype;
    
	return new Object();
}
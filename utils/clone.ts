var FN_NAME = /^function ([^(]*)/;

export default function clone(x) {
	// Not an object
	if (!(x instanceof Object)) {
		return x;
	}
	
	// DOM Element
	if (x instanceof Node) {
		return x.cloneNode(true);
	}
	
	// Date
	if (x instanceof Date) {
		copy = new Date(x.getTime());
	}
	
	// RegExp
	if (x instanceof RegExp) {
		return new RegExp(x);
	}
	
	var copy;
	
	// Array
	if (Array.isArray(x)) {
		copy = [];
		
		x.forEach(function(value) {
			copy.push(value === x ? copy : value);
		});
		
		return copy;
	}
	
	var key;
	
	// Function
	if (x instanceof Function) {
		key = (key = FN_NAME.exec(x)) ? key[1] : '';
		copy = Function('fn', 'return function ' + key + '() {\n\treturn fn.apply(this, arguments);\n}')(x);
		copy.prototype = x.prototype;
		
		return copy;
	}
	
	// Every other object
	copy = create(Object.getPrototypeOf(x));
	
	for (key in x) {
		if (x.hasOwnProperty(key)) {
			copy[key] = x[key] === x ? copy : x[key];
		}
	}
	
	return copy;
}

export function create(prototype) {
	var Object,
        name;
	
	if (prototype.constructor instanceof Function) {
        name = (name = FN_NAME.exec(prototype.constructor)) ? name[1] : '';
		
		Object = Function('name', 'return function ' + name + '() {}')(name);
	} else {
		Object = function() {};
	}
	
	Object.prototype = prototype;
    
	return new Object();
}
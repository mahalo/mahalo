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
		
		x.forEach(value => copy.push(value === x ? copy : value));
		
		return copy;
	}
	
	// Function
	if (x instanceof Function) {
		var name = (key = FN_NAME.exec(x)) ? key[1] : '';
		copy = Function('fn', 'return function ' + name + '() {\n\treturn fn.apply(this, arguments);\n}')(x);
		copy.prototype = x.prototype;
		
		return copy;
	}
	
	// Every other object
	var keys = Object.keys(x),
		len = keys.length,
		i = 0,
		key;
	
	copy = create(Object.getPrototypeOf(x));
	
	while (i < len) {
		key = keys[i++];
		copy[key] = x[key] === x ? copy : x[key];
	}
	
	return copy;
}

export function create(prototype) {
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
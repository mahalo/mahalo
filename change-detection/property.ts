import asap from '../utils/asap';
import isObject from '../utils/isObject';
import equals from '../utils/equals';

var callbacksByKeys = new WeakMap(),
	computedKeys = new Map(),
	_defineProperty = Object.defineProperty,
	_defineProperties = Object.defineProperties,
	arrayPrototype = Array.prototype,
	methods = {
		push: arrayPrototype.push,
		pop: arrayPrototype.pop,
		shift: arrayPrototype.shift,
		unshift: arrayPrototype.unshift,
		splice: arrayPrototype.splice,
		reverse: arrayPrototype.reverse,
		sort: arrayPrototype.sort
	},
	counter = 0,
	name,
	scheduled;

for (name in methods) {
	wrapMethod(name, methods[name]);
}

Object.defineProperty = defineProperty;
Object.defineProperties = defineProperties;

export function assign(obj, key, val?) {
	switch (arguments.length) {
		case 2:
			memberAssignment(obj, key);
			break;
			
		case 3:
			memberAssignment(obj, key, val);
	}
	
	scheduleCheck();
}

export function observe(obj, key, callback) {
	var keys = callbacksByKeys.get(obj),
		callbacks;
	
	if (!keys) {
		keys = {};
		callbacksByKeys.set(obj, keys);
	}
	
	if (!keys.hasOwnProperty(key)) {
		callbacks = new Set();
		keys[key] = callbacks;
	} else {
		callbacks = keys[key];
	}
	
	key && !callbacks.size && isComputed(obj, key) && observeComputed(obj, key);
	
	callbacks.add(callback);
}

export function unobserve(obj, key, callback) {
	var keys = callbacksByKeys.get(obj),
		callbacks;
	
	if (!keys) {
		return;
	}
	
	if (!keys.hasOwnProperty(key)) {
		return;
	}
	
	callbacks = keys[key];
	
	callbacks.delete(callback);
	
	key && !callbacks.size && isComputed(obj, key) && unobserveComputed(obj, key);
}

function isComputed(obj, key) {
	var desc = Object.getOwnPropertyDescriptor(obj, key);
	
	return desc && desc.get;
}

function observeComputed(obj, key) {
	var keys = computedKeys.get(obj);
	
	if (!keys) {
		keys = {};
		computedKeys.set(obj, keys);
	}
	
	keys[key] = obj[key];
}

function unobserveComputed(obj, key) {
	var keys = computedKeys.get(obj);
	
	if (!keys) {
		return;
	}
	
	delete keys[key];
	
	if (!keys.size) {
		computedKeys.delete(obj);
	}
}

function memberAssignment(obj, key, value?) {
	var oldValue = obj[key],
		oldObj = clone(obj);
	
	if (arguments.length === 2) {
		delete obj[key];
	} else {
		obj[key] = value;
	}
	
	if (!hasCallbacks(obj)) {
		return;
	}
	
	executeCallbacks(obj, key, oldValue);
	executeCallbacks(obj, '', oldObj);
}

function hasCallbacks(obj) {
	var keys = callbacksByKeys.get(obj);
	
	return !!keys;
}

function executeCallbacks(obj, key, oldValue) {
	var keys = callbacksByKeys.get(obj),
		newValue = obj[key];
	
	if (!keys || !keys.hasOwnProperty(key) || newValue === oldValue) {
		return;
	}
	
	keys[key].forEach(function(callback) {
		callback(obj, key, oldValue);
	});
}

function scheduleCheck() {
	if (scheduled) {
		return;
	}
	
	scheduled = true;
	asap(checkComputed);
}

function checkComputed() {
	scheduled = false;
	
	computedKeys.forEach(function(keys, obj) {
		var oldObj = clone(obj),
			newValue,
			oldValue,
			key;
		
		for (key in keys) {
			newValue = obj[key],
			oldValue = keys[key];
			
			if (keys.hasOwnProperty(key) && newValue !== oldValue) {
				keys[key] = newValue;
				executeCallbacks(obj, key, oldObj[key] = oldValue);
			}
		}
		
		executeCallbacks(obj, '', oldObj);
	});
	
	if (scheduled) {
		if (counter++ > 10) {
			console.error('XS Error: Too many update cycles');
		}
	} else {
		counter = 0;
		// console.log('XS Debug: ' + counter + ' update cycles run');
	}
}

function wrapMethod(name, method) {
	_defineProperty(arrayPrototype, name, {
		value: function() {
			var result,
				before;

			if (hasCallbacks(this)) {
				before = this.slice();
				result = method.apply(this, arguments);
				arrayChanges(this, before);
			} else {
				result = method.apply(this, arguments);
			}

			return result;
		}
	});
}

function defineProperty(obj, key, desc) {
	var oldValue = obj[key],
		oldObj = clone(obj),
		result = _defineProperty(obj, key, desc);
	
	if (hasCallbacks) {
		executeCallbacks(obj, key, oldValue);
		executeCallbacks(obj, '', oldObj);
	}
	
	return result;
}

function defineProperties(obj, keys) {
	var oldObj = clone(obj),
		result = _defineProperties(obj, keys),
		key;
	
	if (hasCallbacks(obj)) {
		for (key in keys) {
			if (keys.hasOwnProperty(key) && obj[key] !== keys[key].value) {
				executeCallbacks(obj, key, oldObj[key]);
			}
		}
		
		executeCallbacks(obj, '', oldObj);
	}
	
	return result;
}

function arrayChanges(arr, oldArr) {
	var val = arr[0],
		i = 0,
		len = oldArr.length;

	while (val) {
		if (i >= len || val !== oldArr[i]) {
			executeCallbacks(arr, i, oldArr[i])
		}
		
		val = arr[++i];
	}

	if (arr.length !== len) {
		val = oldArr[i];

		while (val) {
			executeCallbacks(arr, i, val);
			val = oldArr[++i];
		}
		
		executeCallbacks(arr, 'length', len);
	}
	
	executeCallbacks(arr, '', oldArr);
}

function clone(obj) {
	if (Array.isArray(obj)) {
		return obj.slice();
	}
	
	return Object.assign(Object.create(Object.getPrototypeOf(obj)), obj);
}
/**
 * xs.js - Object.observe
 * 
 * An Object.observe polyfill for older browsers. 
 * 
 * @since 0.4
 * @author Markus Schmidt
 */

import asap from '../utils/asap';
import {addCallback, deleteCallback, hasCallbacks} from './callbacks';
import {createChange} from './changes';

export var observe, unobserve, set, del;

if (Object.hasOwnProperty('observe')) {
	observe = Object.observe;
	unobserve = Object.unobserve;
} else {
	observePolyfill(Array);
}

function observePolyfill(Array) {
	var defineProperty = Object.defineProperty,
		defineProperties = Object.defineProperties,
		arrProto = Array.prototype,
		arrayMethods = {
			push: arrProto.push,
			pop: arrProto.pop,
			shift: arrProto.shift,
			unshift: arrProto.unshift,
			splice: arrProto.splice,
			reverse: arrProto.reverse,
			sort: arrProto.sort
		},
		method;
	
	// Export _set and _del
	set = _set;
	del = _del;
	observe = addCallback;
	unobserve = deleteCallback;
	
	// Wrap defineProperty and defineProperties
	defineProperties(Object, {
		defineProperty: {
			value: _defineProperty
		},
		defineProperties: {
			value: _defineProperties
		}
	});
	
	// Wrap array methods
	for (method in arrayMethods) {
		wrapMethod(method);
	}
	
	function _set(obj, key, value, newValue) {
		if (obj.hasOwnProperty(key) && newValue === value) {
			return value;
		}
	
		if (hasCallbacks(obj)) {
			if (Array.isArray(obj) && key === 'length') {
				var before = obj.slice();
	
				obj.length = value;
	
				arrayChanges(obj, before);
	
				return value;
			}
	
			if (obj.hasOwnProperty(key)) {
				createChange(obj, key, newValue);
			} else {
				createChange(obj, key);
			}
		}
	}
	
	function _del(obj, key, value) {
		if (hasCallbacks(obj) && obj.hasOwnProperty(key)) {
			createChange(obj, key, value);
		}
		
		return delete obj[key];
	}
	
	function _defineProperty(obj, key, desc) {
		if (hasCallbacks(obj) && obj[key] !== desc.value) {                    
			createChange(obj, key, obj[key]);
		}
	
		defineProperty(obj, key, desc);
	}
	
	function _defineProperties(obj, keys) {
		if (hasCallbacks(obj)) {
			var key;
	
			for (key in keys) {
				if (keys.hasOwnProperty(key) && obj[key] !== keys[key].value) {
					createChange(obj, key, obj[key]);
				}
			}
		}
	
		defineProperties(obj, keys);
	}
	
	function wrapMethod(method) {
		defineProperty(arrProto, method, {
			value: function() {
				var result,
					before;
	
				if (hasCallbacks(this)) {
					before = this.slice();
					result = arrayMethods[method].apply(this, arguments);
					arrayChanges(this, before);
				} else {
					result = arrayMethods[method].apply(this, arguments);
				}
	
				return result;
			}
		});
	}
	
	function arrayChanges(arr, before) {
		var val = arr[0],
			i = 0,
			len = before.length;
	
		while (val) {
			if (i >= len) {
				createChange(arr, i);
			} else if (val !== before[i]) {
				createChange(arr, i, before[i]);
			}
			
			val = arr[++i];
		}
	
		if (arr.length !== len) {
			val = before[i];
	
			while (val) {
				createChange(arr, i, val);
				val = before[++i];
			}
	
			createChange(arr, 'length', len);
		}
	}
}
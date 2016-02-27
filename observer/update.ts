import {set, del} from './observe';
import asap from '../utils/asap';
import keyPath from '../utils/keyPath';
import {addCallback, deleteCallback} from './callbacks';
import {createChange} from './changes';

var observedKeys = new Map(),
	scheduled = false,
	counter = 0,
	update;

if (Object.hasOwnProperty('observe')) {
	update = function update(value, obj, key, newValue) {
		if (isMemberAssignment(obj, key)) {
			
			if (arguments.length === 3) {
				return delete obj[key];
			}
			
			return newValue;
		}
		
		scheduleCheck();
		
		return value;
	}
} else {
	update = function update(value, obj, key, newValue) {
		if (isMemberAssignment(obj, key)) {
			
			if (arguments.length === 3) {
				return del(obj, key, value);
			}
			
			set(obj, key, value, newValue);
			
			return newValue;
		}
		
		scheduleCheck();
		
		return value;
	}
}

export default update;

export function observeComputed(obj, key, callback) {
	addCallback(obj, callback);
	addObservedKey(obj, key);
}

export function unobserveComputed(obj, key, callback) {
	deleteCallback(obj, callback);
	deleteObservedKey(obj, key);
}

function scheduleCheck() {
	if (scheduled) {
		return;
	}
	
	scheduled = true;
	
	asap(check);
}

function addObservedKey(obj, key) {
	var keys = observedKeys.get(obj);
	
	if (!keys) {
		keys = new Map();
		observedKeys.set(obj, keys);
	}
	
	keys.set(key, obj[key]);
}

function deleteObservedKey(obj, key) {
	var keys = observedKeys.get(obj);
	
	if (!keys) {
		return;
	}
	
	keys.delete(key);
	
	if (!keys.size) {
		observedKeys.delete(obj);
	}
}

function check() {
	scheduled = false;
	
	if (counter > 10) {
		console.warn('There were more than 10 update cycles. Further cycles have been denied.');
		counter = 0;
		return;
	}
	
	observedKeys.forEach(checkKeys);
	
	if (scheduled) {
		counter++;
	} else {
		counter = 0;
	}
}

function checkKeys(keys, obj) {
	keys.forEach(function (oldValue, key) {
		var newValue = obj[key];
		
		if (newValue !== oldValue) {
			keys.set(key, newValue);
			
			createChange(obj, key, oldValue);
		}
	});
}

function isMemberAssignment(obj, key) {
	return obj && typeof obj === 'object' && obj !== null && typeof key === 'string';
}
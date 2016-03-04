import keyPath from '../utils/keyPath';
import equals from '../utils/equals';
import {watch} from './watch';

var callbacks = new WeakMap();

export function addCallback(obj, keyPath, callback) {
	var paths = callbacks.get(obj);
	
	if (!paths) {
		paths = new Map();
		callbacks.set(obj, paths);
	}
	
	var callbackList = paths.get(keyPath);
	
	if (!callbackList) {
		callbackList = new Set();
		paths.set(keyPath, callbackList);
	}
	
	callbackList.add(callback);
}

export function deleteCallback(obj, keyPath?, callback?) {	
	var paths = callbacks.get(obj);
	
	if (!paths) {
		return;
	}
	
	if (typeof keyPath !== 'string') {
		callbacks.delete(obj);
		return;
	}
	
	if (typeof callback === 'function') {
		var callbackList = paths.get(keyPath);
		
		if (callbackList) {
			callbackList.delete(callback);
			callbackList.size || paths.delete(keyPath);
		}
	} else {
		paths.delete(keyPath);
	}
	
	paths.size || callbacks.delete(obj);
}

export function notify(obj, path, oldValue) {
	var paths = callbacks.get(obj);
	
	if (!paths) {
		return;
	}
	
	var callbackList = paths.get(path),
		newValue = keyPath(obj, path);
	
	if (!callbackList || equals(newValue, oldValue)) {
		return;
	}
	
	callbackList.forEach(function (callback) {
		callback(newValue, oldValue);
	});
}
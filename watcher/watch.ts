/**
 * xs.js - watch
 * 
 * @author Markus Schmidt
 */

import {observe, unobserve} from '../observer/observe';
import {observeComputed, unobserveComputed} from '../observer/update';
import {default as keyPath, toKeyPath, toKeys} from '../utils/keyPath';
import {addCallback, deleteCallback, notify} from './callbacks';
import isObject from '../utils/isObject';

var interceptors = new WeakMap(),
	observedKeys = new WeakMap();

export function watch(obj, path, callback?) {
    if (!path) {
        return;
    }

    watchKeys(obj, toKeys(path), getInterceptor(obj, path));
    
    typeof callback === 'function' && addCallback(obj, path, callback);
}

export function unwatch(obj, path, callback) {
	unwatchKeys(obj, toKeys(path), getInterceptor(obj, path));
	
    deleteCallback(obj, path, callback);
}

function getInterceptor(obj, keyPath) {
	var paths = interceptors.get(obj);
	
	if (!paths) {
		paths = new Map();
		interceptors.set(obj, paths);
	}
	
	var callback = paths.get(keyPath);
	
	if (!callback) {
		callback = interceptor.bind(obj, keyPath);
		paths.set(keyPath, callback);
	}
	
	return callback;
}

function interceptor(path, changes) {
	var obj = changes[0].object,
		before = Object.assign({}, obj),
		i = changes.length,
		change;
	
	while (i--) {
		change = changes[i];
		
		switch (change.type) {
			case 'update':
			case 'delete':
				before[change.name] = change.oldValue;
				break;

			case 'add':
				delete before[change.name];
		}
	}
	
	var callback = interceptors.get(this).get(path),
		pathRemaining = updatePath(this, toKeys(path), obj, before, callback),
		oldValue = pathRemaining === '' ? before : pathRemaining && keyPath(before, pathRemaining);
	
	notify(this, path, oldValue);
}

function updatePath(observer, keys, obj, before, callback) {
	if (observer === obj) {
		unwatchKeys(before, keys.slice(), callback);
		watchKeys(obj, keys.slice(), callback);
		
		return toKeyPath(keys);
	}
	
	observer = observer[keys.shift()] || {};
	
	return updatePath(observer, keys, obj, before, callback);
}

function observeKey(obj, key, callback) {
	var desc = Object.getOwnPropertyDescriptor(obj, key);
	
	if (desc && typeof desc.get === 'function') {
		observeComputed(obj, key, callback);
	}
}

function unobserveKey(obj, key, callback) {
	var desc = Object.getOwnPropertyDescriptor(obj, key);
	
	if (desc && typeof desc.get === 'function') {
		unobserveComputed(obj, key, callback);
	}
}

function watchKeys(obj, keys, callback) {
	var key = keys.shift(),
		val = obj[key];
	
	if (isObject(val)) {
		if (keys.length) {
			watchKeys(val, keys, callback);
		} else {
			observe(val, callback);
		}
	}
	
	observe(obj, callback);
	observeKey(obj, key, callback);
}

function unwatchKeys(obj, keys, callback) {
	var key = keys.shift(),
		val = obj[key];
	
	if (isObject(val)) {
		if (keys.length) {
			unwatchKeys(val, keys, callback);
		} else {
			unobserve(val, callback);
		}
	}
	
	unobserve(obj, callback);
	unobserveKey(obj, key, callback);
}
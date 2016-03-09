import {default as keyPath, toKeys, toKeyPath} from '../utils/key-path';
import {observe, unobserve} from './property';
import equals from '../utils/equals';

var callbacks = new WeakMap(),
	interceptors = new WeakMap();

export function watch(obj: Object, path: string, callback: Function) {
	var paths = callbacks.get(obj),
		callbacksForPath;
	
	if (!paths) {
		paths = {};
		callbacks.set(obj, paths);
	}
	
	if (!paths.hasOwnProperty(path)) {
		callbacksForPath = new Set();
		paths[path] = callbacksForPath;
		
		watchKeys(obj, '', toKeys(path));
	} else {
		callbacksForPath = paths[path];
	}
	
	callbacksForPath.add(callback);
}

export function unwatch(obj: Object, path?: string, callback?: Function) {
	var paths = callbacks.get(obj),
		callbacksForPath,
		keys;
	
	if (!paths) {
		return;
	}
	
	if (!path) {
		for (path in paths) {
			unwatchKeys(obj, '', toKeys(path), obj);
		}
		
		callbacks.delete(obj);
		
		return;
	}
	
	if (!paths.hasOwnProperty(path)) {
		return;
	}
	
	callbacksForPath = paths[path];
	
	callback && callbacksForPath.delete(callback);
	
	if (!callback || !callbacksForPath.size) {
		delete paths[path];
		
		unwatchKeys(obj, '', toKeys(path), obj);
	}
	
	if (!Object.keys(paths).length) {
		callbacks.delete(obj);
	}
}

function watchKeys(obj: Object, pathTo: string, keys: Array<string>) {
	var key = keys.shift() || '',
		value = !pathTo ? obj : keyPath(obj, pathTo),
		interceptor;
	
	if (!(value instanceof Object)) {
		return;
	}
	
	pathTo = pathTo + (pathTo && key ? '.' : '') + toKeyPath(key);
	interceptor = getInterceptor(obj, pathTo, toKeyPath(keys));
	
	if (!key) {
		return observe(value, key, interceptor);
	}
	
	observe(value, key, interceptor);
	watchKeys(obj, pathTo, keys);
}

function unwatchKeys(obj: Object, pathTo: string, keys: Array<string>, value) {
	var key = keys.shift() || '',
		interceptor;
	
	if (!(value instanceof Object)) {
		return;
	}
	
	pathTo = pathTo + (pathTo && key ? '.' : '') + toKeyPath(key);
	interceptor = getInterceptor(obj, pathTo, toKeyPath(keys));
	
	if (!key) {
		return unobserve(value, key, interceptor);
	}
	
	unobserve(value, key, interceptor);
	unwatchKeys(obj, pathTo, keys, value[key]);
}

function getInterceptor(obj: Object, pathTo: string, pathFrom: string) {
	var paths = interceptors.get(obj),
		interceptorsByPath,
		interceptorForPath;
	
	if (!paths) {
		interceptors.set(obj, paths = {});
	}
	
	paths = paths.hasOwnProperty(pathTo) ? paths[pathTo] : paths[pathTo] = {};
	
	return paths.hasOwnProperty(pathFrom) ? paths[pathFrom] : paths[pathFrom] = interceptor.bind(obj, pathTo, pathFrom);
}

function interceptor(pathTo: string, pathFrom: string, obj: Object, key: string, value) {
	var oldValue = !pathFrom ? value : keyPath(value, pathFrom.substr(key.length)),
		keys = toKeys(pathFrom);
	
	unwatchKeys(this, pathTo, keys.slice(), value);
	watchKeys(this, pathTo, keys);
	
	executeCallbacks(this, pathTo + (pathFrom ? '.' + pathFrom : ''), oldValue);
}

function executeCallbacks(obj: Object, path: string, oldValue) {
	var newValue = keyPath(obj, path);
	
	if (equals(newValue, oldValue)) {
		return;
	}
	
	var callbacksByPath = callbacks.get(obj);
	
	if (!callbacksByPath) {
		return;
	}
	
	var callbacksForPath = callbacksByPath[path];
	
	callbacksForPath && callbacksForPath.forEach(function(callback) {
		callback(newValue, oldValue);
	});
}
import {assign, observe, unobserve} from '../change-detection/property';

var scopes = new WeakMap(),
	localScopes = new WeakMap(),
	callbacksByKey = new WeakMap();

export default class Scope {
	constructor(scope, localScope, keys) {
		var obj = Object.create(Object.getPrototypeOf(scope)),
			key;
		
		callbacksByKey.set(obj, {});
		
		for (key in keys) {
			if (keys.hasOwnProperty(key)) {
				createKey(obj, key, localScope);
			}
		}
		
		for (key in scope) {
			if (scope.hasOwnProperty(key)) {
				createKey(obj, key, scope);
			}
		}
		
		scopes.set(obj, scope);
		localScopes.set(obj, localScope);
		
		return obj;
	}
	
	enter() {}
	
	leave() {}
	
	remove() {}
}

export function remove(obj) {
	var scope = scopes.get(obj),
		localScope = localScopes.get(obj),
		key;
	
	// if (!scope) {
	// 	return;
	// }
	
	for (key in scope) {
		if (scope.hasOwnProperty(key)) {
			removeKey(obj, key, scope);
		}
	}
	
	for (key in obj) {
		if (obj.hasOwnProperty(key)) {
			removeKey(obj, key, localScope);
		}
	}
	
	scopes.delete(obj);
	localScopes.delete(obj);
	callbacksByKey.delete(obj);
}

function createKey(obj, key, scope) {
	if (obj.hasOwnProperty(key)) {
		return;
	}
	
	var desc = Object.getOwnPropertyDescriptor(scope, key),
		callbacks = callbacksByKey.get(obj)[key] = {
			scope: callback.bind(obj),
			obj: null
		};
	
	obj[key] = scope[key];
	
	observe(scope, key, callbacks.scope);
	
	if (desc && desc.get && !desc.set) {
		return;
	}
	
	callbacks.obj = callback.bind(scope);
	
	observe(obj, key, callbacks.obj);
}

function removeKey(obj, key, scope) {
	var callbacks = callbacksByKey.get(obj)[key];
	
	unobserve(scope, key, callbacks.scope);
	
	callbacks.obj && unobserve(obj, key, callbacks.obj);
	
	delete obj[key];
}

function callback(obj, key) {
	assign(this, key, obj[key]);
}
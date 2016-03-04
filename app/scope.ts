import {assign, observe, unobserve} from '../change-detection/property';

var scopes = new WeakMap(),
	localScopes = new WeakMap(),
	callbacksByKey = new WeakMap();

export default class Scope {
	constructor(scope, localScope, properties) {
		var obj = Object.create(Object.getPrototypeOf(scope)),
			property = properties[0],
			i = 0,
			value;
		
		scopes.set(obj, scope);
		localScopes.set(obj, localScope);
		callbacksByKey.set(obj, {});
		
		while (property) {
			createProperty(obj, property, localScope);
			
			property = properties[++i];
		}
		
		for (property in scope) {
			if (scope.hasOwnProperty(property)) {
				createProperty(obj, property, scope);
			}
		}
		
		return obj;
	}
}

export function remove(obj) {
	var scope = scopes.get(obj),
		localScope = localScopes.get(obj),
		property;
	
	for (property in scope) {
		if (typeof scope[property] !== 'function') {
			removeProperty(obj, property, scope);
		}
	}
	
	for (property in obj) {
		if (obj.hasOwnProperty(property)) {
			removeProperty(obj, property, localScope);
		}
	}
	
	scopes.delete(obj);
	localScopes.delete(obj);
	callbacksByKey.delete(obj);
}

function createProperty(obj, key, scope) {
	if (obj.hasOwnProperty(key)) {
		return;
	}
	
	var desc = Object.getOwnPropertyDescriptor(scope, key),
		callbacks = callbacksByKey.get(obj)[key] = {
			scope: callback.bind(scope),
			obj: null
		};
	
	obj[key] = scope[key];
	
	observe(scope, key, callbacks.scope);
	
	if (desc && desc.get && !desc.set) {
		return;
	}
	
	callbacks.obj = callback.bind(obj);
	
	observe(obj, key, callbacks.obj);
}

function removeProperty(obj, key, scope) {
	var callbacks = callbacksByKey.get(obj)[key];
	
	unobserve(scope, key, callbacks.scope);
	
	callbacks.obj && unobserve(obj, key, callbacks.obj);
	
	delete obj[key];
}

function callback(obj, key) {
	assign(this, key, obj[key]);
}
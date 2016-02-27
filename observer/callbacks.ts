var callbacks = new WeakMap();

export function addCallback(obj, callback) {
	var callbackList = callbacks.get(obj);
	
	if (!callbackList) {
		callbackList = new Set();
		callbacks.set(obj, callbackList);
	}
	
	callbackList.add(callback);
}

export function deleteCallback(obj, callback) {
	var callbackList = callbacks.get(obj);
	
	if (!callbackList) {
		return;
	}
	
	if (!callback) {
		callbacks.delete(obj);
		return;
	}
	
	callbackList.delete(callback);
	
	if (!callbackList.size) {
		callbacks.delete(obj);
	}
}

export function hasCallbacks(obj) {
	return callbacks.has(obj);
}

export default function notify(obj, changes) {
	var callbackList = callbacks.get(obj);
	
	if (!callbackList) {
		return;
	}
	
	callbackList.forEach(function (callback) {
		callback(changes);
	});
}
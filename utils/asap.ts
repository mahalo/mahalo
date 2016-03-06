/**
 * xs.js - asap
 * 
 * This function executes a callback after the current event loop.
 * If window.postMessage is available it will take precedence
 * otherwise MessageChannel is used as a fallback.
 * 
 * @module
 * @since 0.3
 * @author Markus Schmidt
 */

var queue: Array<Function> = [],
	asap;

if (postMessageSupport()) {
	window.addEventListener('message', function(event) {
		if (event.source !== window || event.data !== 'access-core/utils/asap') {
			return;
		}
		
        runQueue();
        
		event.stopImmediatePropagation();
	});

	asap = function asap(callback: Function) {
		queue.push(callback);
		queue.length === 1 && window.postMessage('access-core/utils/asap', '*');
	};
} else {
	var channel = new MessageChannel();
	
	channel.port1.onmessage = function() {
		runQueue();
	};

	asap = function asap(callback: Function) {
		queue.push(callback);
		queue.length === 1 && channel.port2.postMessage('*');
	};
}

export default asap;

function postMessageSupport() {
	var support = true,
		onMessage = function () {
			support = false;
		};
	
	window.addEventListener('message', onMessage);
	window.postMessage('', '*');
	window.removeEventListener('message', onMessage);
	
	return support;
}

function runQueue() {
    var callback = queue[0],
        i = 0;
    
    while (callback) {
        callback();
        callback = queue[++i];
    }
    
    queue.length = 0;
}
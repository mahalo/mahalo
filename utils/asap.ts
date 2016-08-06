/**
 * This module exports a utility function for postponing execution
 * of provided callbacks.
 */

/**
 * This function executes a callback after the current event loop.
 * If window.postMessage is available it will take precedence
 * otherwise MessageChannel is used as a fallback.
 */
var asap = supportsPostMessage() ? getPostMessage() : getFallback();

export default asap;


//////////


var MESSAGE = 'mahalo/utils/asap#' + Math.random(),
    queue: Array<Function> = [];

function supportsPostMessage() {
    var support = true;
    
    window.addEventListener('message', callback);
    window.postMessage(MESSAGE, '*');
    window.removeEventListener('message', callback);
    
    return support;
    
    
    //////////
    
    
    function callback() {
        support = false;
    }
}

function getPostMessage() {
    window.addEventListener('message', event => {
        if (event.source !== window || event.data !== MESSAGE) {
            return;
        }
        
        runQueue();
        
        event.stopImmediatePropagation();
    });
    
    return function asap(callback: Function, thisArg?) {
        queue.push(callback.bind(thisArg));
        queue.length === 1 && window.postMessage(MESSAGE, '*');
    }
}

function getFallback() {
    var channel = new MessageChannel();
    
    channel.port1.onmessage = () => runQueue();
    
    return function asap(callback: Function, thisArg?) {
        queue.push(callback.bind(thisArg));
        queue.length === 1 && channel.port2.postMessage('*');
    }
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
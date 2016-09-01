/**
 * This module exports a utility function for postponing execution
 * of provided callbacks.
 */

/***/

const message = 'mahalo/utils/asap#' + Math.random();
const queue: Function[] = [];

/**
 * This function executes a callback after the current event loop.
 * If window.postMessage is available it will take precedence
 * otherwise MessageChannel is used as a fallback.
 */
const asap = supportsPostMessage() ? getPostMessage() : getFallback();

export default asap;


//////////


function supportsPostMessage() {
    let support = true;
    
    window.addEventListener('message', callback);
    window.postMessage(message, '*');
    window.removeEventListener('message', callback);
    
    return support;
    
    
    //////////
    
    
    function callback() {
        support = false;
    }
}

function getPostMessage() {
    window.addEventListener('message', event => {
        if (event.source !== window || event.data !== message) {
            return;
        }
        
        runQueue();
        
        event.stopImmediatePropagation();
    });
    
    return function asap(callback: Function, thisArg?) {
        queue.push(callback.bind(thisArg));
        queue.length === 1 && window.postMessage(message, '*');
    }
}

function getFallback() {
    let channel = new MessageChannel();
    
    channel.port1.onmessage = () => runQueue();
    
    return function asap(callback: Function, thisArg?) {
        queue.push(callback.bind(thisArg));
        queue.length === 1 && channel.port2.postMessage('*');
    }
}

function runQueue() {
    let callback = queue[0];
    let i = 0;
    
    while (callback) {
        callback();
        callback = queue[++i];
    }
    
    queue.length = 0;
}
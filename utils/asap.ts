/*
 * mahalo/utils/asap
 * 
 * This function executes a callback after the current event loop.
 * If window.postMessage is available it will take precedence
 * otherwise MessageChannel is used as a fallback.
 * 
 * @module
 * @since 0.3
 * @author Markus Schmidt
 */

var MESSAGE = 'mahalo/utils/asap',
    queue: Array<Function> = [],
    asap;

if (postMessageSupport()) {
    
    window.addEventListener('message', event => {
        if (event.source !== window || event.data !== MESSAGE) {
            return;
        }
        
        runQueue();
        
        event.stopImmediatePropagation();
    });

    asap = function asap(callback: Function, thisArg?) {
        queue.push(callback.bind(thisArg));
        queue.length === 1 && window.postMessage(MESSAGE, '*');
    };
    
} else {
    
    var channel = new MessageChannel();
    
    channel.port1.onmessage = () => runQueue();
    
    asap = function asap(callback: Function, thisArg) {
        queue.push(callback.bind(thisArg));
        queue.length === 1 && channel.port2.postMessage('*');
    };
    
}

export default asap;


//////////


function postMessageSupport() {
    var support = true;
    
    window.addEventListener('message', callback);
    window.postMessage(MESSAGE, '*');
    window.removeEventListener('message', callback);
    
    return support;
    
    function callback() {
        support = false;
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
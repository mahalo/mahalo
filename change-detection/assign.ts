/**
 * This module exports the assign function that is responsible for
 * change detection.
 */

/***/

import {scheduleCheck, hasCallbacks, executeCallbacks} from './key';
import {default as Scope, getComponent} from '../app/scope';
import clone from '../utils/clone';

/**
 * The assign function triggers Mahalo's change detection. However
 * when writing your application in TypeScript you don't have to take
 * care of this yourself and won't need to use this function at all.
 * 
 * ### Example
 * 
 * In the following examples you can see different assignments an their
 * counterparts using assign.
 * 
 * ```javascript
 * var foo = 0,
 *     bar = 0,
 *     baz = {x: 0};
 * 
 * // Variable assignments are just wrapped
 * ++foo; // 1
 * assign(++foo); // 2
 * 
 * foo + (bar = 10); // bar 12
 * foo + assign(bar = 10); // 12
 * 
 * // Member assignments must be explicit
 * foo + baz.x++; // 2
 * foo + assign(baz, 'x', baz.x + 1); // 3
 * ```
 * 
 * @alias {assign} from mahalo
 */
export default function assign(obj?: Object, key?: string|number, val?) {
    switch (arguments.length) {
        case 2:
            return memberAssignment(obj, key);
            
        case 3:
            return memberAssignment(obj, key, val);
    }
    
    scheduleCheck();
    
    return obj;
}


//////////


window.onresize = assign;

/**
 * Handles the assigment of members and ensures that callbacks
 * for those members are executed. 
 */
function memberAssignment(obj: Object, key: string|number, value?) {
    obj = obj instanceof Scope ? getComponent.call(obj, key) : obj;
    
    var oldValue = obj[key],
        oldObj = clone(obj);
    
    if (arguments.length === 2) {
        delete obj[key];
    } else {
        obj[key] = value;
    }
    
    executeCallbacks(obj, key, oldValue);
    executeCallbacks(obj, null, oldObj);
    
    scheduleCheck();
    
    return value;
}
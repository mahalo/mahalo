import {scheduleCheck, hasCallbacks, executeCallbacks} from './property';
import {default as Scope, getComponent} from '../app/scope';
import clone from '../utils/clone';

window.onresize = assign;

/**
 * 
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

/**
 * 
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
    
    if (!hasCallbacks(obj)) {
        return value;
    }
    
    executeCallbacks(obj, key, oldValue);
    executeCallbacks(obj, '', oldObj);
    
    scheduleCheck();
    
    return value;
}
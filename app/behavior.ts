/**
 * 
 */

/***/

import {Expression, Scope, watch} from '../index';
import {injectDependencies, getDependency} from './injector';
import asap from '../utils/asap';

/**
 * @alias {Behavior} from mahalo
 */
export default class Behavior implements IBehavior {
    static inject: Object;
    
    static update: string;
    
    static bindings: Object;
    
    constructor(value: string) {
        var Constructor = this.constructor;
        
        createBinding(this, value, Constructor);
        
        while (Constructor !== Behavior) {
            injectDependencies(this, Constructor);
            createBindings(this, Constructor);
            
            Constructor = Object.getPrototypeOf(Constructor);
        }
    }
}

export function removeBinding(behavior: Behavior) {
    if (expressions.has(behavior)) {
        expressions.get(behavior).unwatch();
        expressions.delete(behavior);
    }
}


//////////


var expressions = new WeakMap();

function createBinding(behavior: Behavior, value: string, Constructor) {
    var update = Constructor.update,
        expression;
    
    if (typeof update !== 'string' || typeof behavior[update] !== 'function') {
        return;
    }
    
    expression = new Expression(value, getDependency(Scope));
    
    expression.watch(
        newValue => behavior[update](newValue)
    );
    
    expressions.set(behavior, expression);
    
    asap(() => behavior[update](expression.compile()));
}

function createBindings(behavior: Behavior, Constructor) {
    var bindings = Constructor.bindings;
    
    if (!(bindings instanceof Object)) {
        return;
    }
    
    var keys = Object.keys(bindings),
        i = keys.length,
        key;
    
    while (i--) {
        key = keys[i];
        watch(behavior, key, behavior[bindings[key]].bind(behavior));
    }
}
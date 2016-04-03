import {injectDependencies, getDependency} from './injector';
import {Expression} from '../index';
import asap from '../utils/asap';
import {Scope, watch} from '../index';

var expressions = new WeakMap();

export default class Behavior {
    static inject: Object;
    
    static bind: string;
    
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
    
    remove() {}
}

function createBinding(behavior: Behavior, value: string, Constructor) {
    var bind = Constructor.bind,
        expression;
    
    if (typeof bind !== 'string' || typeof behavior[bind] !== 'function') {
        return;
    }
    
    expression = new Expression(value, getDependency(Scope));
    
    expression.watch(
        newValue => behavior[bind](newValue)
    );
    
    expressions.set(behavior, expression);
    
    asap(() => behavior[bind](expression.compile()));
}

export function removeBinding(behavior: Behavior) {
    if (expressions.has(behavior)) {
        expressions.get(behavior).unwatch();
        expressions.delete(behavior);
    }
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
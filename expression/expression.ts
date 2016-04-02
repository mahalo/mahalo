import {watch, unwatch} from '../mahalo';
import Parser from './parser';
import clone from '../utils/clone';
import equals from '../utils/equals';

export default class Expression {
    parser: Parser;
    
    scope: Object;
    
    callbacks: Set<Function>;
    
    interceptor: Function;
    
    value;
    
    constructor(expression: string|Parser, scope: Object) {
        var parser = typeof expression === 'string' ? new Parser(expression) : expression;
        
        this.parser = parser;
        this.scope = scope;
        this.callbacks = new Set();
        this.interceptor = parser.paths ? interceptor.bind(this) : computedInterceptor.bind(this);
    }
    
    watch(callback: Function) {
        if (!this.callbacks.size) {
            
            if (this.parser.paths)  {
                
                this.parser.paths.forEach(
                    path => watch(this.scope, path, this.interceptor)
                );
                
            } else {
                
                Object.defineProperty(this, 'computed', {
                    enumerable: true,
                    get() {
                        return this.compile();
                    }
                });
                
                watch(this, 'computed', this.interceptor);
                
            }
            
        }
        
        this.callbacks.add(callback);
    }
    
    unwatch(callback?: Function) {
        if (callback) {
            this.callbacks.delete(callback);
        } else {
            this.callbacks.clear();
        }
        
        if (this.callbacks.size) {
            return;
        }
        
        if (!this.parser.paths) {
            return unwatch(this, 'computed', this.interceptor);
        }
        
        this.parser.paths.forEach(
            path => unwatch(this.scope, path, this.interceptor)
        );
    }
    
    compile() {
        return this.parser.compile(this.scope);
    }
}

function interceptor() {
    var oldValue = this.value,
        newValue = this.compile();
    
    if (equals(newValue, oldValue)) {
        return;
    }
    
    this.value = clone(newValue);
    
    this.callbacks.forEach(
        callback => callback(newValue, oldValue)
    );
}

function computedInterceptor(newValue) {
    var oldValue = this.value;
    
    this.value = clone(newValue);
    
    this.callbacks.forEach(
        callback => callback(newValue, oldValue)
    );
}
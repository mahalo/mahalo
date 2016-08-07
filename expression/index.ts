/**
 * This module is responsible for Mahalo expressions.
 */

/***/

import {watch, unwatch} from '../index';
import Parser from './parser';
import clone from '../utils/clone';
import equals from '../utils/equals';

/**
 * Expressions are an essential part of Mahalo. They consist of an
 * expression string and a scope in which they will be executed.
 * With their ability to watch for changes in their evaluated
 * result expressions are a very powerful feature of the framework.
 * 
 * That beeing said most of their magic is happening behind the scenes
 * and their implicit usage should be rare. For common use cases
 * Mahalo provides higher level access to them. Most notably in
 * a [[mahalo.Template]]. 
 * 
 * ### Syntax
 * 
 * The syntax of Mahalo expressions is similar JavaScript itself.
 * However there are the following differences.
 * 
 * #### Variables
 * 
 * You cannot access any global or local variables since expressions
 * are evaluated in a scope. So every identifier will be treated as
 * a property of the expressions scope.
 * 
 * To go deeper into an object you can of course use the dot and
 * bracket syntax just like in JavaScript. In case the property
 * of the scope you're looking for contains characters that are
 * not allowed in valid JavaScript identifiers you can start with the
 * bracket syntax prefixed with a dot.
 * 
 * ```html
 * ${ .['§property'] }
 * ```
 * 
 * #### Comparisons
 * 
 * All comparisons will be strictly equal on evaluation but the syntax
 * only knows loose operators (**==**, **!=**, **<=**, **>=**, **<**, **>**).
 * 
 * #### Unallowed stuff
 * 
 * Statements like **if**, **for**, **while**, **try** are not allowed.
 * Also there are no declarations or assignments of any kind possible in
 * Mahalo expression.
 * 
 * @alias {Expression} from mahalo
 */
export default class Expression {
    /**
     * The parser for the expression string.
     */
    parser: Parser;
    
    /**
     * The scope that is used for evaluation.
     */
    scope: Object;
    
    /**
     * A set of callbacks that are eexcuted when the result of the
     * expression changed.
     */
    callbacks: Set<Function>;
    
    /**
     * The interceptor that will be used.
     */
    interceptor: Function;
    
    /**
     * The result of evaluating the expression.
     */
    value;
    
    constructor(expression: string, scope: Object) {
        var parser = new Parser(expression);
        
        this.parser = parser;
        this.scope = scope;
        this.callbacks = new Set();
        this.interceptor = parser.paths ? interceptor.bind(this) : computedInterceptor.bind(this);
    }
    
    /**
     * Adds a callback that is executed when the expression's
     * result has changed.
     */
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
    
    /**
     * Removes a previously added callback from the expression.
     */
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
    
    /**
     * Evaluates the expression.
     */
    compile() {
        return this.parser.compile(this.scope);
    }
}


//////////


/**
 * An interceptor for expressions without dirty checking needed.
 * It is used for every key path of the expression.
 */
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

/**
 * An interceptor for expressions that need dirty checking.
 */
function computedInterceptor(newValue) {
    var oldValue = this.value;
    
    this.value = clone(newValue);
    
    this.callbacks.forEach(
        callback => callback(newValue, oldValue)
    );
}
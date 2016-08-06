/**
 * The module contains the event behavior.
 */

/***/

import {Scope, Behavior, Expression, assign} from '../index';

/**
 * The EventBehavior can be used to attach user events to a
 * DOM element. It is part of Mahalo's special template syntax.
 * 
 * To make use of them you can prefix the event you want to attach
 * with a **@** symbol and use it as the attribute name.
 * 
 * Whenever the event is triggered Mahalo will evaluate the value
 * of the attribute in the local scope. Temporarily the special
 * key **$event** is available in the local scope.
 * 
 * ### Example
 * 
 * A simple example that attaches a **click** event to a button.
 * 
 * ```html
 * <button @click="addUser($event)">Add user</button>
 * ```
 *
 * @alias {EventBehavior} from mahalo
 */
export default class EventBehavior extends Behavior {
    static inject = {
        element: Element,
        scope: Scope
    };
    
    /**
     * The element the event is attached to.
     */
    element: Element;
    
    /**
     * A reference to the local scope of the [[mahalo.Component]]
     * that the event was attached to.
     */
    scope: Scope|IComponent;
    
    /**
     * The event to capture.
     */
    event: string;
    
    /**
     * An expression created from the attributes value.
     */
    expression: Expression;
    
    /**
     * A callback that intercepts the event and delegates
     * it to the component.
     */
    interceptor: EventListener;
    
    constructor(value: string, name: string) {
        super(value);
        
        this.event = name.substr(1);
        
        this.expression = new Expression(value, this.scope);
        
        this.element.addEventListener(this.event, this.interceptor = interceptor.bind(this));
    }
    
    remove() {
        this.element.addEventListener(this.event, this.interceptor);
    }
}


//////////


function interceptor(event) {
    assign(this.scope, '$event', event);
    
    this.expression.compile();
    
    assign(this.scope, '$event');
}
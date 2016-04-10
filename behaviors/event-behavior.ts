/**
 *
 */

/***/

import {Scope, Behavior, Expression, assign} from '../index';

/**
 * 
 */
export default class EventBehavior extends Behavior {
    static inject = {
        element: Element,
        scope: Scope
    };
    
    element: Element;
    
    scope: Scope|IComponent;
    
    event: string;
    
    expression: Expression;
    
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
/**
 * This module is responsible for attribute behaviors.

/***/

import {Behavior} from '../index';

/**
 * Attribute behaviors are part of Mahalo's special template syntax.
 * They can be used to change a DOM elements attribute when an expression's
 * result changes.
 * 
 * To make use of them you can prefix the attribute you want to set with
 * a **#** symbol.
 * 
 * ##### Example
 * 
 * This simple example sets the id of a div element to the value of **myProperty**
 * which is looked up in the local scope.
 * 
 * ```html
 * <div #id="myProperty"></div>
 * ```
 */
export default class AttributeBehavior extends Behavior {
    static inject = {element: Element};
    
    static update = 'update';
    
    element: Element;
    
    name: string;
    
    constructor(value, name) {
        super(value);
        
        this.name = name.substr(1);
    }
    
    update(newValue) {
        this.element.setAttribute(this.name, newValue || '');
    }
}
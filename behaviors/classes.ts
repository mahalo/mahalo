/**
 * This module holds the Classes behavior.
 */

/***/

import {Behavior} from '../index';
import {addClass, removeClass} from '../utils/element-classes';

/**
 * The Classes behavior can be used to automatically add classes to an
 * element or remove them based on some truth value. The value should
 * be an expression that results to an object where the keys are the
 * relevant class names and their values any valid [[mahalo.Expression]].
 * 
 * ### Example
 * 
 * This simple example adds the bold class to an h1 element whenever the
 * value of **isBold** in the local scope is truthy.
 * 
 * ```html
 * <h1 classes="{bold: isBold}">Mahalo</h1>
 * ```
 * 
 * @alias {Classes} from mahalo
 */
export default class Classes extends Behavior {
    static inject = {element: Element};
    
    static update = 'update';
    
    /**
     * The element the behavior was attached to.
     */
    element: Element;
    
    /**
     * Updates the class list of the element.
     */
    update(classes: Object) {
        if (!(classes instanceof Object)) {
            return;
        }
        
        let element = this.element;
        let names = Object.keys(classes);
        let i = names.length;
        
        while (i--) {
            let name = names[i];
            
            if (classes[name]) {
                addClass(element, name);
            } else {
                removeClass(element, name);
            }
        }
    }
}
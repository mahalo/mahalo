/**
 * This module contains the Content behavior.
 */

/***/

import {Behavior} from '../index';

/**
 * The Content behavior can be used to automatically add and change HTML
 * inside of an element. The value should be an expression that results to
 * a string containing your HTML. Be aware that content is created as is
 * an might be vulnerable. If the value is user input you should make sure
 * it is properly escaped.
 * 
 * ### Example
 * 
 * This simple example parses the value of the **html** property looked up
 * in the element's local scope.
 * 
 * ```html
 * <div content="html"></div>
 * ```
 * 
 * @alias {Content} from mahalo
 */
export default class Content extends Behavior {
    static inject = {element: Element};
    
    static update = 'update';
    
    /**
     * The element the behavior was attached to.
     */
    element: Element;
    
    /**
     * Updates the HTML inside the element.
     */
    update(html: string) {
        let element = this.element;
        
        element instanceof HTMLElement && (element.innerHTML = html);
    }
}
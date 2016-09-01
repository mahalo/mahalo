/**
 * This module holds the Link behavior.
 */

/***/

import {Behavior} from '../index';
import {setByID} from '../components/route';

/**
 * The Link behavior can be used to navigate to a desired
 * route by using its ID. A click event will be attached to
 * the element on which the behavior is defined.
 * 
 * ### Example
 * 
 * A simple example that creates a link to the route with the
 * ID **about**.
 * 
 * ```html
 * <button link="about">About</button>
 * ```
 * 
 * @alias {Link} from mahalo
 */
export default class Link extends Behavior {
    static inject = {element: Element};
    
    /**
     * The element the behavior was attached to.
     */
    element: Element;
    
    /**
     * The callback function that triggers the route change.
     */
    listener: EventListener;
    
    constructor(id: string) {
        super(id);
        
        this.listener = event => {
            if (!setByID(id)) {
                return;
            }
            
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        };
        
        this.element.addEventListener('click', this.listener);
    }
    
    /**
     * Removes the added event listener.
     */
    remove() {
        this.element.removeEventListener('click', this.listener);
    }
}
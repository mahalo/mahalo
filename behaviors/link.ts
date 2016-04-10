/**
 * 
 */

/***/

import {Behavior} from '../index';
import {setByID} from '../components/route';

/**
 * @alias {Link} from mahalo
 */
export default class Link extends Behavior {
    static inject = {element: Element};
    
    element: Element;
    
    click: EventListener;
    
    constructor(id) {
        super(id);
        
        this.click = event => {
            if (!setByID(id)) {
                return;
            }
            
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        };
        
        this.element.addEventListener('click', this.click);
    }
    
    remove() {
        this.element.removeEventListener('click', this.click);
    }
}
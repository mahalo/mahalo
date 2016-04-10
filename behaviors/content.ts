/**
 * 
 */

/***/

import {Behavior} from '../index';

/**
 * @alias {Content} from mahalo
 */
export default class Content extends Behavior {
    static inject = {element: Element};
    
    static update = 'update';
    
    element: Element;
    
    update(html) {
        var element = this.element;
        
        element instanceof HTMLElement && (element.innerHTML = html);
    }
}
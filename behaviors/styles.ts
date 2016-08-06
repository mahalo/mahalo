/**
 * This module holds the Classes behavior.
 */

/***/

import {Behavior} from '../index';

/**
 * The Styles behavior can be used to dynamically add CSS styles to an
 * element. The value should be an expression that results to an object
 * where the keys are the relevant CSS property names and their values
 * any valid [[mahalo.Expression]] that results to the desired value.
 * 
 * ### Example
 * 
 * This simple example sets the color of an h1 element to the value of
 * **textColor** which is looked up in the local scope.
 * 
 * ```html
 * <h1 styles="{color: textColor}">Mahalo</h1>
 * ```
 * 
 * @alias {Styles} from mahalo
 */
export default class Styles extends Behavior {
    static inject = {element: Element};
    
    static update = 'update';
    
    /**
     * The element the behavior was attached to.
     */
    element: Element;
    
    /**
     * Updates the styles of the element.
     */
    update(styles: Object) {
        if (!(styles instanceof Object)) {
            return;
        }
        
        var element = this.element,
            style: CSSStyleDeclaration = 'style' in element && element['style'];
        
        if (!style) {
            return;
        }
        
        var names = Object.keys(styles),
            i = names.length,
            name;
        
        while (i--) {
            name = names[i];
            style[name] = styles[name];
        }
    }
}
import hasAnimation from './has-animation';
import {addClass, removeClass} from '../utils/element-classes';
import asap from '../utils/asap';

/**
 * Makes sure that enter is called on a controllers component when
 * an enter animation has finished or instantly when no animation
 * was defined.
 * 
 * @param ensure When true even already compiled controllers will be entered but not appended
 */
export default function enter(controller: IComponentController, parentNode: Element|DocumentFragment, ensure?: boolean) {
    var node = controller.node,
        element = node instanceof Element && node;
    
    // When the animation is not ensured append element to parentNode
    ensure || parentNode.appendChild(element);
    
    // If the element is already entering stop it
    controller.isEntering && removeClass(element, ENTER_CLASS);
    
    // Only continue when the controller is new or ensured
    if (!ensure && controller.compiled) {
        return;
    }
    
    controller.compiled = true;
    
    // Check for existing animation and start it
    if (hasAnimation(controller, ENTER_CLASS)) {
        return startAnimation(controller, element);
    }
    
    // No animation was found so just call enter
    typeof controller.component.enter === 'function' && controller.component.enter();
}


//////////


var ENTER_CLASS = 'mh-enter';

/**
 * Adds event listeners to the element, starts animatiing and
 * calls enter on the component when the animation has finished.
 */
function startAnimation(controller: IComponentController, element: Element) {
    controller.isEntering = true;
    
    element.addEventListener('animationend', end);
    element.addEventListener('webkitAnimationEnd', end);
    
    addClass(element, ENTER_CLASS);
    
    
    //////////
    
    
    /**
     * Event listener to clean up the element and call the
     * component's enter method
     */
    function end(event: Event) {
        controller.isEntering = false;
        
        element.removeEventListener('animationend', end);
        element.removeEventListener('webkitAnimationEnd', end);
        
        removeClass(element, ENTER_CLASS);
        
        typeof controller.component.enter === 'function' && controller.component.enter();
        
        event.stopPropagation();
    }
}
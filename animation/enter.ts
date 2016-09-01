import {ComponentController} from '../index';
import hasAnimation from './has-animation';
import {addClass, removeClass} from '../utils/element-classes';
import asap from '../utils/asap';

const enterClass = 'mh-enter';

/**
 * Makes sure that enter is called on a controllers component when
 * an enter animation has finished or instantly when no animation
 * was defined.
 * 
 * @param ensure When true even already compiled controllers will be entered but not appended.
 */
export default function enter(controller: ComponentController, parentNode: Element|DocumentFragment, ensure?: boolean) {
    let element = <Element>controller.node;
    
    // When the animation is not ensured append element to parentNode
    ensure || parentNode.appendChild(element);
    
    // If the element is already entering stop it
    if (controller.isEntering) {
        controller.isEntering = false;
        removeClass(element, enterClass);
    }
    
    // Only continue when the controller is new or ensured
    if (!ensure && controller.compiled) {
        return;
    }
    
    controller.compiled = true;
    
    // Check for existing animation and start it
    if (hasAnimation(controller, enterClass)) {
        return startAnimation(controller, element);
    }
    
    // No animation was found so just call enter
    controller.component.enter();
}


//////////


/**
 * Adds event listeners to the element, starts animatiing and
 * calls enter on the component when the animation has finished.
 */
function startAnimation(controller: ComponentController, element: Element) {
    controller.isEntering = true;
    
    element.addEventListener('animationend', end);
    element.addEventListener('webkitAnimationEnd', end);
    
    addClass(element, enterClass);
    
    
    //////////
    
    
    /**
     * Event listener to clean up the element and call the
     * component's enter method.
     */
    function end(event: Event) {
        controller.isEntering = false;
        
        element.removeEventListener('animationend', end);
        element.removeEventListener('webkitAnimationEnd', end);
        
        removeClass(element, enterClass);
        
        controller.component.enter();
        
        event.stopPropagation();
    }
}
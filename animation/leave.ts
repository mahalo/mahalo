import {ComponentController} from '../index';
import hasAnimation from './has-animation';
import {addClass, removeClass} from '../utils/element-classes';
import asap from '../utils/asap';

const enterClass = 'mh-enter';
const leaveClass = 'mh-leave';

/**
 * Makes sure that a leave is called on a controller's component and
 * that it is removed after a leave animation has finished or instantly
 * if none is available.
 */
export default function leave(controller: ComponentController) {
    let element = <Element>controller.node;
    let parentNode = element.parentNode;
    
    controller.component.leave();
    
    // When the element is not in the DOM or has no animation end here
    if (!parentNode || !hasAnimation(controller, leaveClass)) {
        controller.remove();
        return;
    }
    
    // Find the sibling before which the element should be inserted
    let siblings = parentNode.childNodes;
    let nextSibling = siblings[siblings.length - controller.position];
    
    // Stop maybe existing enter animation
    if (controller.isEntering) {
        controller.isEntering = false;
        removeClass(element, enterClass);
    }
    
    // Insert the element in its old place
    parentNode.insertBefore(element, nextSibling);
    
    startAnimation(controller, element);
}


//////////


/**
 * Adds event listeners to the element, starts its leave animation
 * and removes the controller after the animation is done.
 */
function startAnimation(controller: ComponentController, element: Element) {
    controller.isLeaving = true;
    
    element.addEventListener('animationend', end);
    element.addEventListener('webkitAnimationEnd', end);
    
    addClass(element, leaveClass);
    
    /**
     * Event listener to clean up the element and remove the controller.
     */
    function end(event: Event) {
        controller.isLeaving = false;
        
        element.removeEventListener('animationend', end);
        element.removeEventListener('webkitAnimationEnd', end);
        
        removeClass(element, leaveClass);
        
        controller.remove();
        
        event.stopPropagation();
    }
}
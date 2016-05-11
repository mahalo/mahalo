import hasAnimation from './has-animation';
import {addClass, removeClass} from '../utils/element-classes';
import asap from '../utils/asap';

/**
 * Makes sure that a leave is called on a controller's component and
 * that it is removed after a leave animation has finished or instantly
 * if none is available.
 */
export default function leave(controller: IComponentController) {
    var node = controller.node,
        element = node instanceof Element && node,
        parentNode = element.parentNode,
        siblings,
        nextSibling;
    
    typeof controller.component.leave === 'function' && controller.component.leave();
    
    // When the element is not in the DOM or has no animation end here
    if (!parentNode || !hasAnimation(controller, LEAVE_CLASS)) {
        controller.remove();
        return;
    }
    
    // Find the sibling before which the element should be inserted
    siblings = parentNode.childNodes,
    nextSibling = siblings[siblings.length - controller.position];
    
    // Stop maybe existing enter animation
    if (controller.isEntering) {
        controller.isEntering = false;
        removeClass(element, ENTER_CLASS);
    }
    
    // Insert the element in its old place
    parentNode.insertBefore(element, nextSibling);
    
    startAnimation(controller, element);
}


//////////


var ENTER_CLASS = 'mh-enter',
    LEAVE_CLASS = 'mh-leave';

/**
 * Adds event listeners to the element, starts its leave animation
 * and removes the controller after the animation is done.
 */
function startAnimation(controller: IComponentController, element: Element) {
    controller.isLeaving = true;
    
    element.addEventListener('animationend', end);
    element.addEventListener('webkitAnimationEnd', end);
    
    addClass(element, LEAVE_CLASS);
    
    /**
     * Event listener to clean up the element and remove the controller.
     */
    function end(event: Event) {
        controller.isLeaving = false;
        
        element.removeEventListener('animationend', end);
        element.removeEventListener('webkitAnimationEnd', end);
        
        removeClass(element, LEAVE_CLASS);
        
        controller.remove();
        
        event.stopPropagation();
    }
}
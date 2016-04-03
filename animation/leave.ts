import hasAnimation from './has-animation';
import {addClass, removeClass} from '../utils/element-classes';
import asap from '../utils/asap';

var ENTER_CLASS = 'mh-enter',
    LEAVE_CLASS = 'mh-leave';

export default function leave(controller: ComponentController) {
    var node = controller.node,
        element = node instanceof Element && node,
        parentNode = element.parentNode,
        siblings,
        nextSibling;
    
    if (!parentNode) {
        return;
    }
        
    siblings = parentNode.childNodes,
    nextSibling = siblings[siblings.length - controller.position];
    
    controller.isEntering && removeClass(element, ENTER_CLASS);
    
    parentNode.insertBefore(element, nextSibling);
    
    controller.component.leave();
    
    if (hasAnimation(controller, LEAVE_CLASS)) {
        return startAnimation(controller, element);
    }
    
    controller.remove();
}

function startAnimation(controller: ComponentController, element: Element) {
    controller.isLeaving = true;
    
    element.addEventListener('animationend', end);
    element.addEventListener('webkitAnimationEnd', end);
    
    addClass(element, LEAVE_CLASS);
    
    function end(event: Event) {
        controller.isLeaving = false;
        
        element.removeEventListener('animationend', end);
        element.removeEventListener('webkitAnimationEnd', end);
        
        removeClass(element, LEAVE_CLASS);
        
        controller.remove();
        
        event.stopPropagation();
    }
}
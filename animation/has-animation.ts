import {addClass, removeClass} from '../utils/element-classes';
import equals from '../utils/equals';

/**
 * Checks a controller for an existing CSS animations for a given class name.
 */
export default function hasAnimation(controller: IComponentController, className: string) {
    var parent = controller.parent;
    
    // Check if a parent is still animating and prevent animations in such a case
    while (parent) {
        if (parent.isEntering || parent.isLeaving) {
            return false;
        }
        
        parent = parent.parent;
    }
    
    var node = controller.node,
        element = node instanceof Element && node,
        oldAnimations = getAnimations(element),
        newAnimations;
    
    addClass(element, className);
    
    newAnimations = getAnimations(element);
    
    removeClass(element, className);
    
    return !equals(oldAnimations, newAnimations);
}


//////////


/**
 * Returns a list with names of all CSS animations currently set
 * on a given element.
 */
function getAnimations(element: Element) {
    var style = getComputedStyle(element),
        animations = style.getPropertyValue('animation-name')
            || style.getPropertyValue('-webkit-animation-name')
            || style.getPropertyValue('-moz-animation-name');
    
    return animations ? animations.replace('none', '').split(' ').sort() : [];
}
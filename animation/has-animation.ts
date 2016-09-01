import {ComponentController} from '../index';
import {addClass, removeClass} from '../utils/element-classes';
import equals from '../utils/equals';

const isPhantomJS = /PhantomJS/.test(navigator.userAgent);

/**
 * Checks a controller for an existing CSS animations for a given class name.
 */
export default function hasAnimation(controller: ComponentController, className: string) {
    if (isPhantomJS) {
        return false;
    }

    let parent = controller.parent;
    
    // Check if a parent is still animating and prevent animations in such a case
    while (parent) {
        if (parent.isEntering || parent.isLeaving) {
            return false;
        }
        
        parent = parent.parent;
    }
    
    let element = <Element>controller.node;
    let oldAnimations = getAnimations(element);
    
    addClass(element, className);
    
    let newAnimations = getAnimations(element);
    
    removeClass(element, className);
    
    return !equals(oldAnimations, newAnimations);
}


//////////


/**
 * Returns a list with names of all CSS animations currently set
 * on a given element.
 */
function getAnimations(element: Element) {
    let style = getComputedStyle(element);
    let animations = style.getPropertyValue('animation-name') || style.getPropertyValue('-webkit-animation-name') || style.getPropertyValue('-moz-animation-name');
    
    return animations ? animations.replace('none', '').split(' ').sort() : [];
}
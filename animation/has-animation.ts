import {addClass, removeClass} from '../utils/element-classes';
import equals from '../utils/equals';

export default function hasAnimation(controller: ComponentController, className: string) {
	var node = controller.node,
		element = node instanceof Element && node,
		oldAnimations = getAnimations(element),
		newAnimations;
	
	addClass(element, className);
	
	newAnimations = getAnimations(element);
	
	removeClass(element, className);
	
	return !equals(oldAnimations, newAnimations);
}

function getAnimations(element: Element) {
	var style = getComputedStyle(element),
		vendor,
		animations;
	
	if (style.getPropertyValue('animation-name')) {
		vendor = '';
	} else if (style.getPropertyValue('-webkit-animation-name')) {
		vendor = '-webkit-';
	} else if (style.getPropertyValue('-moz-animation-name')) {
		vendor = '-moz-';
	} else {
		return [];
	}
	
	animations = style.getPropertyValue(vendor + 'animation-name').replace('none', '');
	
	return animations ? animations.split(' ').sort() : [];
}
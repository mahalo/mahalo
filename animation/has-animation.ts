import equals from '../utils/equals';

export default function hasAnimation(element: Element, className: string) {
	var oldAnimations = getAnimations(element),
		newAnimations;
	
	element.classList.add(className);
	
	newAnimations = getAnimations(element);
	
	element.classList.remove(className);
	
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
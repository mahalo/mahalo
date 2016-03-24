import hasAnimation from './has-animation';
import asap from '../utils/asap';

var ENTER_CLASS = 'mh-enter';

export default function enter(controller: ComponentController, parentNode: Element|DocumentFragment) {
	var node = controller.node,
		element = node instanceof Element && node;
	
	parentNode.appendChild(element);
	
	controller.isEntering && element.classList.remove(ENTER_CLASS);
	
	if (controller.compiled) {
		return;
	}
	
	controller.compiled = true;
	
	hasAnimation(element, ENTER_CLASS) && startAnimation(controller, element);
}

function startAnimation(controller: ComponentController, element: Element) {
	controller.isEntering = true;
	
	element.addEventListener('animationend', end);
	element.addEventListener('webkitAnimationEnd', end);
	
	element.classList.add(ENTER_CLASS);
	
	function end(event: Event) {
		controller.isEntering = false;
		
		element.removeEventListener('animationend', end);
		element.removeEventListener('webkitAnimationEnd', end);
		
		element.classList.remove(ENTER_CLASS);
		
		event.stopPropagation();
	}
}
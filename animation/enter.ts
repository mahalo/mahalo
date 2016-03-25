import hasAnimation from './has-animation';
import addClass from './add-class';
import removeClass from './remove-class';
import asap from '../utils/asap';

var ENTER_CLASS = 'mh-enter';

export default function enter(controller: ComponentController, parentNode: Element|DocumentFragment) {
	var node = controller.node,
		element = node instanceof Element && node;
	
	parentNode.appendChild(element);
	
	controller.isEntering && removeClass(controller, ENTER_CLASS);
	
	if (controller.compiled) {
		return;
	}
	
	controller.compiled = true;
	
	hasAnimation(controller, ENTER_CLASS) && startAnimation(controller, element);
}

function startAnimation(controller: ComponentController, element: Element) {
	controller.isEntering = true;
	
	element.addEventListener('animationend', end);
	element.addEventListener('webkitAnimationEnd', end);
	
	addClass(controller, ENTER_CLASS);
	
	function end(event: Event) {
		controller.isEntering = false;
		
		element.removeEventListener('animationend', end);
		element.removeEventListener('webkitAnimationEnd', end);
		
		removeClass(controller, ENTER_CLASS);
		
		event.stopPropagation();
	}
}
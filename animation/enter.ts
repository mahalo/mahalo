import hasAnimation from './has-animation';
import {addClass, removeClass} from '../utils/element-classes';
import asap from '../utils/asap';

var ENTER_CLASS = 'mh-enter';

export default function enter(controller: ComponentController, parentNode: Element|DocumentFragment, ensure?: boolean) {
	var node = controller.node,
		element = node instanceof Element && node;
	
	ensure || parentNode.appendChild(element);
	
	controller.isEntering && removeClass(element, ENTER_CLASS);
	
	if (!ensure && controller.compiled) {
		return;
	}
	
	controller.compiled = true;
	
	if (hasAnimation(controller, ENTER_CLASS)) {
		return startAnimation(controller, element);
	}
	
	controller.component.enter();
}

function startAnimation(controller: ComponentController, element: Element) {
	controller.isEntering = true;
	
	element.addEventListener('animationend', end);
	element.addEventListener('webkitAnimationEnd', end);
	
	addClass(element, ENTER_CLASS);
	
	function end(event: Event) {
		controller.isEntering = false;
		
		element.removeEventListener('animationend', end);
		element.removeEventListener('webkitAnimationEnd', end);
		
		removeClass(element, ENTER_CLASS);
		
		controller.component.enter();
		
		event.stopPropagation();
	}
}
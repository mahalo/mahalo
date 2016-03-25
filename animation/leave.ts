import hasAnimation from './has-animation';
import addClass from './add-class';
import removeClass from './remove-class';
import asap from '../utils/asap';

var ENTER_CLASS = 'mh-enter',
	LEAVE_CLASS = 'mh-leave';

export default function leave(controller: ComponentController) {
	var node = controller.node,
		element = node instanceof Element && node,
		parentNode = element.parentNode,
		siblings = parentNode.childNodes,
		nextSibling = siblings[siblings.length - controller.position];
	
	controller.isEntering && removeClass(controller, ENTER_CLASS);
	
	parentNode.insertBefore(element, nextSibling);
	
	if (hasAnimation(controller, LEAVE_CLASS)) {
		return startAnimation(controller, element);
	}
	
	controller.remove();
}

function startAnimation(controller: ComponentController, element: Element) {
	controller.isLeaving = true;
	
	element.addEventListener('animationend', end);
	element.addEventListener('webkitAnimationEnd', end);
	
	addClass(controller, LEAVE_CLASS);
	
	function end(event: Event) {
		controller.isLeaving = false;
		
		element.removeEventListener('animationend', end);
		element.removeEventListener('webkitAnimationEnd', end);
		
		removeClass(controller, LEAVE_CLASS);
		
		controller.remove();
		
		event.stopPropagation();
	}
}
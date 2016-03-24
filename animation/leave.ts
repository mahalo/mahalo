import hasAnimation from './has-animation';
import asap from '../utils/asap';

var ENTER_CLASS = 'mh-enter',
	LEAVE_CLASS = 'mh-leave';

export default function leave(controller: ComponentController) {
	var node = controller.node,
		element = node instanceof Element && node,
		parentNode = element.parentNode,
		siblings = parentNode.childNodes,
		nextSibling = siblings[siblings.length - controller.position];
	
	controller.isEntering && element.classList.remove(ENTER_CLASS);
	
	parentNode.insertBefore(element, nextSibling);
	
	if (hasAnimation(element, LEAVE_CLASS)) {
		return startAnimation(controller, element);
	}
	
	controller.remove();
}

function startAnimation(controller: ComponentController, element: Element) {
	controller.isLeaving = true;
	
	element.addEventListener('animationend', end);
	element.addEventListener('webkitAnimationEnd', end);
	
	element.classList.add(LEAVE_CLASS);
	
	function end(event: Event) {
		controller.isLeaving = false;
		
		element.removeEventListener('animationend', end);
		element.removeEventListener('webkitAnimationEnd', end);
		
		element.classList.remove(LEAVE_CLASS);
		
		controller.remove();
		
		event.stopPropagation();
	}
}
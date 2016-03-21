import nextFrame from '../utils/next-frame';

export function enter(controller: ComponentController, parentNode: Element|DocumentFragment) {
	var node = controller.node,
		element = node instanceof Element && node,
		component = controller.component;
	
	nextFrame(afterLeaveStart);
	
	
	//////////
	
	
	function afterLeaveStart() {
		nextFrame(append);
	}
	
	function append() {
		parentNode.appendChild(node);
		
		if (controller.isEntering) {
			element.classList.remove('mh-enter');
			controller.compiled = true;
		}
		
		if (controller.compiled) {
			return;
		}
		
		addAnimationEvent('Start', element, start);
		
		element.classList.add('mh-enter');
		
		nextFrame(afterEnterStart);
	}
	
	function afterEnterStart() {
		removeAnimationEvent('Start', element, start);
		
		if (controller.isEntering) {
			return;
		}
		
		cleanup();
	}
	
	function start() {
		controller.isEntering = true;
		
		addAnimationEvent('End', element, end);
	}
	
	function end() {
		controller.isEntering = false;
		
		removeAnimationEvent('End', element, end);
		
		cleanup();
	}
	
	function cleanup() {
		element.classList.remove('mh-enter');
		
		controller.compiled = true;
		
		typeof component.enter === 'function' && component.enter();
	}
}

export function leave(controller: ComponentController) {
	var node = controller.node,
		element = node instanceof Element && node;
	
	addAnimationEvent('Start', element, start);
	
	element.classList.remove('mh-enter');
	
	nextFrame(addClass);
	
	
	//////////
	
	
	function addClass() {
		element.classList.add('mh-leave');
		
		nextFrame(afterLeaveStart);
	}
	
	function afterLeaveStart() {
		var parentNode = node.parentNode;
		
		removeAnimationEvent('Start', element, start);
		
		if (!controller.isLeaving) {
			return cleanup();
		}
		
		var siblings = parentNode.childNodes,
			sibling = siblings[siblings.length - controller.position];
		
		if (sibling) {
			parentNode.insertBefore(node, sibling);
		} else {
			parentNode.appendChild(node);
		}
	}
	
	function start() {
		controller.isLeaving = true;
		
		addAnimationEvent('End', element, end);
	}
	
	function end() {
		controller.isLeaving = false;
		
		removeAnimationEvent('End', element, end);
		
		cleanup();
	}
	
	function cleanup() {
		var component = controller.component;
		
		controller.remove();
		
		typeof component.leave === 'function' && component.leave();
	}
}

function addAnimationEvent(event: string, node: Element, callback: EventListener) {
	node.addEventListener('webkitAnimation' + event, callback);
	node.addEventListener('mozAnimation' + event, callback);
	node.addEventListener('animation' + event, callback);
}

function removeAnimationEvent(event: string, node: Element, callback: EventListener) {
	node.removeEventListener('webkitAnimation' + event, callback);
	node.removeEventListener('mozAnimation' + event, callback);
	node.removeEventListener('animation' + event, callback);
}
import ComponentController from '../app/component-controller';
import nextFrame from '../utils/next-frame';
import asap from '../utils/asap';

export default class Container {
	controllers: Array<ComponentController>;
	
	template: Template;
	
	children: Array<Generator>;
	
	parentElement: ComponentController;
	
	link: Node;
	
	leaving: Set<ComponentController>;
	
	entering: Set<ComponentController>;
	
	isNew: boolean;
	
	hasChanged: boolean;
	
	constructor(template, children, parentElement, link) {
		this.template = template;
		this.children = children;
		this.parentElement = parentElement;
		this.link = link;
		this.controllers = [];
		this.leaving = new Set();
		this.entering = new Set();
		this.isNew = true;
		
		this.change();
	}
	
	create(node, scope, component) {
		var controller = new ComponentController(node, scope, component);
		
		this.add(controller);
		
		return controller;
	}
	
	add(controller) {
		if (this.isNew) {
			_add.call(this);
		} else {
			nextFrame(_add, this);
		}
		
		function _add() {
			var i = this.controllers.indexOf(controller);
			
			i < 0 || this.controllers.splice(i, 1);
			
			this.controllers.push(controller);
			
			this.change();
			
			if (this.isNew) {
				return this.enter(controller);
			}
			
			nextFrame(
				// () => nextFrame(
					() => this.enter(controller)
				// )
			);
		}
	}
	
	delete(controller) {
		if (this.isNew) {
			_delete.call(this);
		} else {
			nextFrame(_delete, this);
		}
		
		function _delete() {
			var i = this.controllers.indexOf(controller);
			
			if (i < 0) {
				return;
			}
			
			this.controllers.splice(i, 1);
			
			this.change();
			
			this.leave(controller);
		}
	}
	
	change() {
		if (this.hasChanged) {
			return;
		}
		
		var leaving = this.leaving,
			entering = this.entering;
		
		leaving.forEach(function(controller) {
			var node = controller.node;
			
			node.parentNode.removeChild(node);
			controller.isLeaving = false;
		});
		
		leaving.clear();
		
		entering.forEach(function(controller) {
			controller.node.classList.remove('mh-enter');
			controller.isEntering = false;
		});
		
		entering.clear();
		
		this.hasChanged = true;
		
		asap(function() {
			this.isNew = false;
			this.hasChanged = false;
		}, this);
	}
	
	leave(controller: ComponentController) {
		var leaving = this.leaving,
			node = controller.node;
		
		node.addEventListener('webkitAnimationStart', start);
		node.addEventListener('animationStart', start);
		
		node.classList.remove('mh-enter');
		
		this.parentElement.children.delete(controller);
		
		controller.remove();
		
		// nextFrame(() => {
			node.classList.add('mh-leave');
			
			nextFrame(next, this);
		// });
		
		
		//////////
		
		
		function next() {
			node.removeEventListener('webkitAnimationStart', start);
			node.removeEventListener('animationStart', start);
			
			if (!controller.isLeaving && node.parentNode) {
				node.parentNode.removeChild(node);
				
				return;
			}
			
			var sibling = this.controllers[controller.position];
			
			node.parentNode.insertBefore(node, sibling ? sibling.node : this.link);
		}
		
		function start() {
			leaving.add(controller);
			
			controller.isLeaving = true;
			
			node.addEventListener('webkitAnimationEnd', end);
			node.addEventListener('animationEnd', end);
		}
		
		function end() {
			leaving.delete(controller);
			
			controller.isLeaving = false;
			
			node.removeEventListener('webkitAnimationEnd', end);
			node.removeEventListener('animationend', end);
			
			node.parentNode.removeChild(node);
		}
	}
	
	enter(controller: ComponentController) {
		var link = this.link,
			node = controller.node;
		
		link.parentNode.insertBefore(node, link);
		
		asap(
			() => controller.position = this.controllers.indexOf(controller)
		);
		
		if (controller.compiled) {
			return;
		}
		
		var entering = this.entering,
			component = controller.component;
		
		this.template.compile(node, component, controller);
		
		controller.compileChildren(this.children);
		
		this.parentElement.children.add(controller);
		
		controller.compiled = true;
		
		node.addEventListener('webkitAnimationStart', start);
		node.addEventListener('mozAnimationStart', start);
		
		typeof component.enter === 'function' && component.enter();
		
		node.classList.add('mh-enter');
		
		nextFrame(next);
		
		
		//////////
		
		
		function next() {
			node.removeEventListener('webkitAnimationStart', start);
			node.removeEventListener('mozAnimationStart', start);
			
			if (!controller.isEntering) {
				node.classList.remove('mh-enter');
				
				return;
			}
			
			typeof component.enter === 'function' && component.enter();
		}
		
		function start() {
			entering.add(controller);
			
			controller.isEntering = true;
			
			node.addEventListener('webkitAnimationEnd', end);
			node.addEventListener('mozAnimationEnd', end);
		}
		
		function end() {
			entering.delete(controller);
			
			controller.isEntering = false;
			
			node.removeEventListener('webkitAnimationEnd', end);
			node.removeEventListener('mozAnimationEnd', end);
			
			node.classList.remove('mh-enter');
			
			typeof component.enter === 'function' && component.enter();
		}
	}
}
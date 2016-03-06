import ComponentController from '../app/component-controller';
import nextFrame from '../utils/next-frame';

export default class Container {
	controllers: Array<ComponentController>;
	
	template: Template;
	
	children: Array<Generator>;
	
	parentElement: ComponentController;
	
	link: Node;
	
	leaving: Set<ComponentController>;
	
	entering: Set<ComponentController>;
	
	constructor(controllers: Array<ComponentController>) {
		this.controllers = controllers;
		this.leaving = new Set();
		this.entering = new Set();
	}
	
	set(controllers: Array<ComponentController>) {
		var leaving = this.leaving,
			entering = this.entering;
		
		leaving.forEach(function(controller) {
			var node = controller.node;
			
			node.parentNode.removeChild(node);
			controller.isLeaving = false;
		});
		
		leaving.clear();
		
		entering.forEach(function(controller) {
			controller.node.classList.remove('xs-enter');
			controller.isEntering = false;
		});
		
		entering.clear();
		
		nextFrame(function() {
			nextFrame(this.update, this);
		}, this);
		
		this.controllers.forEach(this.leave, this);
		
		this.controllers = controllers;
	}
	
	leave(controller: ComponentController) {
		var leaving = this.leaving,
			node = controller.node;
		
		node.addEventListener('webkitAnimationStart', start);
		node.addEventListener('animationStart', start);
		
		node.classList.remove('xs-enter');
		
		this.parentElement.children.delete(controller);
		
		controller.remove();
		
		nextFrame(function() {
			node.classList.add('xs-leave');
			
			nextFrame(function() {
				node.removeEventListener('webkitAnimationStart', start);
				node.removeEventListener('animationStart', start);
				
				if (!controller.isLeaving && node.parentNode) {
					node.parentNode.removeChild(node);
					
					return;
				}
				
				var sibling = this.controllers[controller.position];
				
				node.parentNode.insertBefore(node, sibling ? sibling.node : this.link);
			}, this);
		}, this);
		
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
	
	update() {
		var link = this.link,
			parentNode = link.parentNode;
		
		this.controllers.forEach(function(controller, i) {
			controller.position = i;
			
			if (!controller.compiled) {
				this.enter(controller);
			}
			
			parentNode.insertBefore(controller.node, link);
		}, this);
	}
	
	enter(controller: ComponentController) {
		var entering = this.entering,
			node = controller.node,
			component = controller.component;
		
		this.template.compile(node, component, controller);
		
		controller.compileChildren(this.children);
		
		this.parentElement.children.add(controller);
		
		controller.compiled = true;
		
		node.addEventListener('webkitAnimationStart', start);
		node.addEventListener('mozAnimationStart', start);
		
		typeof component.enter === 'function' && component.enter();
	
		node.classList.add('xs-enter');
		
		nextFrame(function() {
			node.removeEventListener('webkitAnimationStart', start);
			node.removeEventListener('mozAnimationStart', start);
			
			if (!controller.isEntering) {
				node.classList.remove('xs-enter');
				
				return;
			}
			
			typeof component.enter === 'function' && component.enter();
		});
		
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
			
			node.classList.remove('xs-enter');
			
			typeof component.enter === 'function' && component.enter();
		}
	}
}
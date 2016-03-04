import Element from '../app/element';
import ComponentElement from '../app/componentElement';
import Template from '../app/template';
import nextFrame from '../utils/nextFrame';

export default class ElementList {
	elements: Array<ComponentElement>
	
	template: Template
	
	children: Array<Element>
	
	parentElement: Element
	
	link: Node
	
	leaving: Set<Element>
	
	entering: Set<Element>
	
	constructor(elements) {
		this.elements = elements;
		this.leaving = new Set();
		this.entering = new Set();
	}
	
	set(elements) {
		var leaving = this.leaving,
			entering = this.entering;
		
		leaving.forEach(function(element) {
			var node = element.node;
			
			node.parentNode.removeChild(node);
			element.isLeaving = false;
		});
		
		leaving.clear();
		
		entering.forEach(function(element) {
			console.log(element);
			element.node.classList.remove('xs-enter');
			element.isEntering = false;
		});
		
		entering.clear();
		
		nextFrame(function() {
			nextFrame(this.update, this);
		}, this);
		
		this.elements.forEach(this.animate, this);
		
		this.elements = elements;
	}
	
	animate(element) {
		var leaving = this.leaving,
			node = element.node;
		
		node.addEventListener('webkitAnimationStart', start);
		
		node.classList.remove('xs-enter');
		
		element.remove();
		
		nextFrame(function() {
			node.classList.add('xs-leave');
			
			nextFrame(function() {
				node.removeEventListener('webkitAnimationStart', start);
				
				if (!element.isLeaving && node.parentNode) {
					node.parentNode.removeChild(node);
					
					return;
				}
				
				var sibling = this.elements[element.position];
				
				node.parentNode.insertBefore(node, sibling ? sibling.node : this.link);
			}, this);
		}, this);
		
		function start() {
			leaving.add(element);
			
			element.isLeaving = true;
			
			node.addEventListener('webkitAnimationEnd', end);
		}
		
		function end() {
			leaving.delete(element);
			
			element.isLeaving = false;
			
			node.removeEventListener('webkitAnimationEnd', end);
			
			node.parentNode.removeChild(node);
		}
	}
	
	update() {
		var link = this.link,
			parentNode = link.parentNode;
		
		this.elements.forEach(function(element, i) {
			element.position = i;
			
			if (!element.compiled) {
				this.enter(element);
			}
			
			parentNode.insertBefore(element.node, link);
		}, this);
	}
	
	enter(element) {
		var entering = this.entering,
			children = this.children,
			parentElement = this.parentElement,
			node = element.node,
			component = element.component;
		
		this.template.compile(node, component, element);
		
		element.compileChildren(children);
		
		parentElement.children.push(element);
		
		element.compiled = true;
		
		node.addEventListener('webkitAnimationStart', start);
		
		typeof component.enter === 'function' && component.enter();
	
		node.classList.add('xs-enter');
		
		nextFrame(function() {
			node.removeEventListener('webkitAnimationStart', start);
			
			if (!element.isEntering) {
				node.classList.remove('xs-enter');
				
				return;
			}
			
			typeof component.enter === 'function' && component.enter();
		});
		
		function start() {
			entering.add(element);
			
			element.isEntering = true;
			
			node.addEventListener('webkitAnimationEnd', end);
		}
		
		function end() {
			entering.delete(element);
			
			element.isEntering = false;
			
			node.removeEventListener('webkitAnimationEnd', end);
			
			node.classList.remove('xs-enter');
			
			typeof component.enter === 'function' && component.enter();
		}
	}
}
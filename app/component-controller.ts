import {unwatch} from '../change-detection/watch';

export default class ComponentController implements Controller {
	node: Element;
	
	scope: Component;
	
	parent: ComponentController;
	
	component: Component;
	
	children: Set<Controller>;
	
	compiled: boolean;
	
	position: number;
	
	isEntering: boolean;
	
	isLeaving: boolean;
	
	constructor(node: Element, scope: Component, component: Component) {
		this.node = node;
		this.scope = scope;
		this.component = component;
		this.children = new Set();
	}
	
	compileChildren(children: Array<Generator>) {
		var element = this.node.querySelector('children');
		
		if (!element) {
			return;
		}
		
		var parent = element.parentNode,
			fragment = document.createDocumentFragment(),
			child = children[0],
			i = 0;
		
		while (child) {
			child.compile(fragment, this.scope, this);
			
			child = children[++i];
		}
		
		parent.replaceChild(fragment, element);
	}
	
	remove() {
		var component = this.component;
		
		unwatch(component);
		
		typeof component.remove === 'function' && component.remove();
		
		this.children.forEach(function(controller) {
			controller.remove();
		});
	}
}
import {unwatch} from '../change-detection/watch';
import {default as Scope, remove} from './scope';
import {setDependency} from './component';
import enter from '../animation/enter';
import leave from '../animation/leave';

export default class ComponentController implements Controller {
	node: Element|DocumentFragment;
	
	scope: Scope|Component;
	
	localScope: Scope|Component;
	
	parent: ComponentController;
	
	component: Component;
	
	children: Set<Controller>;
	
	compiled: boolean;
	
	position: number;
	
	isEntering: boolean;
	
	isLeaving: boolean;
	
	constructor(Component, node: Element|DocumentFragment, scope: Scope|Component, parent?: ComponentController, locals?: Object) {
		this.node = node;
		this.parent = parent;
		this.children = new Set();
		this.scope = scope;
		this.position = 1;
		
		// Set dependencies
		setDependency(Element, node);
		setDependency(Scope, scope);
		setDependency(ComponentController, this);
		
		this.component = new Component();
		this.localScope = locals ? new Scope(scope, this.component, locals) : scope;	
	}
	
	init(parentNode: Element|DocumentFragment, template: Template, children: Array<Generator>, animate?: boolean) {
		template.compile(this.node, this.component, this);
		
		this.compileChildren(children);
		
		this.parent.children.add(this);
		
		this.append(parentNode, animate);
	}
	
	append(parentNode, animate) {
		if (animate && this.node instanceof Element) {
			return enter(this, parentNode);
		}
		
		this.compiled = true;
		
		parentNode.appendChild(this.node);
	}
	
	compileChildren(children) {
		var element = this.node.querySelector('children');
		
		if (!element) {
			return;
		}
		
		var parent = element.parentNode,
			fragment = document.createDocumentFragment(),
			child = children[0],
			i = 0;
		
		
		while (child) {
			child.compile(fragment, this.localScope, this);
			
			child = children[++i];
		}
		
		parent.replaceChild(fragment, element);
	}
	
	detach(animate?: boolean) {
		if (animate && (this.node instanceof Element)) {
			return leave(this);
		}
		
		this.remove();
	}
	
	remove() {
		var component = this.component,
			node = this.node;
		
		unwatch(component);
		
		this.localScope !== this.scope && remove(this.localScope);
		
		typeof component.remove === 'function' && component.remove();
		
		this.children.forEach(controller => controller.remove());
		
		this.parent.children.delete(this);
		
		node.parentNode.removeChild(node);
	}
}
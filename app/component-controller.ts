import {unwatch} from '../change-detection/watch';
import Scope from './scope';
import {setDependency} from './injector';
import enter from '../animation/enter';
import leave from '../animation/leave';
import Component from './component';
import Template from '../template/template';

export default class ComponentController implements Controller {
	node: Element|DocumentFragment;
	
	scope: Scope|Component;
	
	localScope: Scope|Component;
	
	parent: ComponentController;
	
	component: Component;
	
	behaviors: Set<Behavior>;
	
	children: Set<Controller>;
	
	compiled: boolean;
	
	position: number;
	
	isEntering: boolean;
	
	isLeaving: boolean;
	
	constructor(Constructor, node: Element|DocumentFragment, scope: Scope|Component, parent?: ComponentController, locals?: Object) {
		this.node = node;
		this.parent = parent;
		this.children = new Set();
		this.scope = scope;
		this.position = 1;
		
		// Set dependencies
		setDependency(Element, node);
		setDependency(Scope, scope);
		setDependency(ComponentController, this);
		
		this.component = new Constructor();
		this.behaviors = new Set();
		this.localScope = locals ? new Scope(scope, this.component, locals) : scope;	
	}
	
	init(parentNode: Element|DocumentFragment, children: Array<Generator>, behaviors: Object, template?: Template) {
		template = template || new Template('<children></children>');
		
		template.compile(this.node, this.component, this);
		
		this.compileChildren(children);
		
		this.parent.children.add(this);
		
		this.append(parentNode);
		
		// Set dependencies
		setDependency(Element, this.node);
		setDependency(Scope, this.localScope);
		setDependency(ComponentController, this);
		setDependency(Component, this.component);
		
		this.initBehaviors(behaviors);
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
			// Set dependency
			setDependency(Component, this.component);
			
			child.compile(fragment, this.localScope, this);
			
			child = children[++i];
		}
		
		parent.replaceChild(fragment, element);
	}
	
	append(parentNode) {
		if (this.node instanceof Element) {
			return enter(this, parentNode);
		}
		
		this.compiled = true;
		
		parentNode.appendChild(this.node);
	}
	
	initBehaviors(behaviors) {
		var Behavior,
			name,
			desc;
		
		for (name in behaviors) {
			if (behaviors.hasOwnProperty(name)) {
				desc = behaviors[name],
				Behavior = desc.Behavior;
				
				this.behaviors.add(new Behavior(desc.value, name));
			}
		}
	}
	
	detach() {
		if (this.node instanceof Element) {
			return leave(this);
		}
		
		this.remove();
	}
	
	remove() {
		var component = this.component,
			node = this.node;
		
		unwatch(component);
		
		typeof component.remove === 'function' && component.remove();
		
		this.children.forEach(controller => controller.remove());
		
		this.parent.children.delete(this);
		
		node.parentNode.removeChild(node);
		
		this.behaviors.forEach(behavior => behavior.remove());
	}
}
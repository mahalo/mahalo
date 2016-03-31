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
	
	locals: Object;
	
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
		this.locals = locals;	
	}
	
	init(parentNode: Element|DocumentFragment, children: Array<Generator>, behaviors: Object, template?: Template) {
		var component = this.component,
			scope = this.scope,
			locals = this.locals,
			node = this.node,
			useScope = Object.getPrototypeOf(component) === Component.prototype;
		
		template = template || new Template('<children></children>');
		
		template.compile(node, useScope ? scope : component, this);
		
		this.localScope = locals ? new Scope(scope, component, locals) : scope;
		
		this.compileChildren(children);
		
		this.parent.children.add(this);
		
		this.append(parentNode);
		
		// Set dependencies
		setDependency(Element, node);
		setDependency(Scope, this.localScope);
		setDependency(ComponentController, this);
		setDependency(Component, component);
		
		this.initBehaviors(behaviors);
		
		component.ready();
	}
	
	compileChildren(children) {
		var node = this.node,
			element = node instanceof Element && node,
			container = node.querySelector('children');
		
		if (!container || element.tagName === 'PRE') {
			return;
		}
		
		var parent = container.parentNode,
			fragment = document.createDocumentFragment(),
			child = children[0],
			i = 0;
		
		while (child) {
			// Set dependency
			setDependency(Component, this.component);
			
			child.compile(fragment, this.localScope, this);
			
			child = children[++i];
		}	
		
		parent.replaceChild(fragment, container);
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
	
	// @todo: Improve removement of children and only detach this.node from DOM
	remove() {
		var component = this.component,
			node = this.node;
		
		unwatch(component);
		
		typeof component.remove === 'function' && component.remove();
		
		this.children.forEach(controller => controller.remove());
		
		this.parent.children.delete(this);
		
		node.parentNode && node.parentNode.removeChild(node);
		
		this.behaviors.forEach(behavior => behavior.remove());
	}
}
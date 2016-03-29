import Template from './template';
import Component from '../app/component';
import {setDependency} from '../app/injector';
import ComponentController from '../app/component-controller';

export default class ComponentGenerator implements Generator {
	node: Node;
	
	template: Template;
	
	Constructor: ComponentConstructor;
	
	behaviors: Object;
	
	children: Array<Generator>;
	
	constructor(node: Element, desc: {Component?: typeof Component, template?: Template} = {}) {
		// desc = desc || {};
		
		var Constructor = desc.Component || Component;
		
		this.node = node;
		
		this.Constructor = Constructor;
		this.template = ('template' in Constructor && new Template(Constructor.template)) || desc.template;
		this.behaviors = {};
	}
	
	compile(parentNode: Element|DocumentFragment, scope: Scope|Component, parent: ComponentController) {
		var Constructor = this.Constructor,
			node = this.node,
			element = node instanceof Element && node,
			controller;
			
		node = node.cloneNode(element.tagName === 'PRE'),
		element = node instanceof Element && node;
		
		setDependency(ComponentGenerator, this);
		
		controller = new ComponentController(Constructor, element, scope, parent, Component.locals);
		
		// if (Constructor === Component) {
		// 	controller.component = parent.component;
		// }
		
		controller.init(parentNode, this.children, this.behaviors, this.template);
	}
}
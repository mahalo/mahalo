import Template from './template';
import {default as Component, setDependency} from '../app/component';
import ComponentController from '../app/component-controller';

export default class ComponentGenerator implements Generator {
	node: Node;
	
	template: Template;
	
	Component: typeof Component;
	
	children: Array<Generator>;
	
	constructor(node: Element, desc: {Component?: typeof Component, template?: Template}) {
		this.node = node;
		
		desc = desc || {};
		
		this.template = desc.template || new Template('<children></children>');
		
		this.Component = desc.Component || Component;
	}
	
	compile(parentNode: Element|DocumentFragment, scope: Scope|Component, parent: ComponentController) {
		var Component = this.Component,
			node = this.node.cloneNode(),
			element = node instanceof Element && node,
			controller;
		
		setDependency(ComponentGenerator, this);
		
		controller = new ComponentController(Component, element, scope, parent, Component.locals);
		controller.init(parentNode, this.template, this.children);
	}
}
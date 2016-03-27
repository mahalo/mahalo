import Template from './template';
import Component from '../app/component';
import {setDependency} from '../app/injector';
import ComponentController from '../app/component-controller';

export default class ComponentGenerator implements Generator {
	node: Node;
	
	template: Template;
	
	Component: ComponentConstructor;
	
	behaviors: Object;
	
	children: Array<Generator>;
	
	constructor(node: Element, desc: {Component?: typeof Component, template?: Template}) {
		this.node = node;
		
		desc = desc || {};
		
		this.Component = desc.Component || Component;
		this.template = ('template' in this.Component && new Template(this.Component.template)) || desc.template;
		this.behaviors = {};
	}
	
	compile(parentNode: Element|DocumentFragment, scope: Scope|Component, parent: ComponentController) {
		var Component = this.Component,
			node = this.node.cloneNode(),
			element = node instanceof Element && node,
			controller;
		
		setDependency(ComponentGenerator, this);
		
		controller = new ComponentController(Component, element, scope, parent, Component.locals);
		controller.init(parentNode, this.children, this.behaviors, this.template);
	}
}
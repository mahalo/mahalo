import Template from './template';
import Component from './component';
import Expression from '../expression/parser';

export default class ComponentNode {
	attributes: Object;
	
	template: Template;
	
	Component: Component;
	
	children: Array<any>;
	
	node: Node;
	
	scope: Object;
	
	constructor(node: Element, desc: {Component?: Component, template?: Template}) {
		this.node = node;
		this.attributes = {};
		
		desc = desc || {};
		
		this.template = desc.template || new Template();
		
		this.Component = desc.Component || Component;
	}
	
	compile(parentNode, scope, parentElement) {
		var Component = this.Component;
		
		if (typeof Component.components !== 'function') {
			throw Error('The static method components must be of type function');
		}
		
		var node = this.node.cloneNode(),
			attributes = this.compileAttributes(Component, node, scope),
			elementList = Component.components(node, scope, attributes),
			link = document.createTextNode('');
		
		elementList.template = this.template;
		elementList.children = this.children;
		elementList.parentElement = parentElement;
		elementList.link = link;
		
		parentNode.appendChild(link);
		
		elementList.update();
	}
	
	compileAttributes(Component, node, scope) {
		if (!Array.isArray(Component.attributes)) {
			return;
		}
		
		var compiledAttributes = {},
			attributes = Component.attributes,
			attribute = attributes[0],
			i = 0,
			value;
		
		while (attribute) {
			if (typeof attribute === 'string') {
				value = node.getAttribute(attribute.toUpperCase());
				
				compiledAttributes[attribute] = new Expression(value).compile(scope);
			}
			
			attribute = attributes[++i];
		}
		
		return compiledAttributes;
	}
}
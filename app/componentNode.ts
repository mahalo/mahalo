import Template from './template';
import Component from './component';
import Expression from '../expression/parser'

export default class ComponentNode {
	attributes: Object;
	
	template: Template;
	
	Component: Component;
	
	children: Array<any>;
	
	node: Node;
	
	scope: Object;
	
	constructor(node: Element, desc) {
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
			components = Component.components(node, scope, attributes);
		
		components.forEach(function(element) {
			var node = element.node,
				component = element.component;
			
			this.template.compile(node, component, element);
			
			element.compileChildren(this.children);
			
			parentElement.children.push(element);
			parentNode.appendChild(node);
			
			typeof component.ready === 'function' && component.ready();
		}, this);
	}
	
	compileAttributes(Component, node, scope) {
		if (typeof Component.attributes !== 'function') {
			return;
		}
		
		var compiledAttributes = {},
			attributes = Component.attributes(),
			attribute = attributes[0],
			i = 0,
			value;
		
		while (attribute) {
			value = node.getAttribute(attribute.toUpperCase());
			
			compiledAttributes[attribute] = new Expression(value).compile(scope);
			
			attribute = attributes[++i];
		}
		
		return compiledAttributes;
	}
}
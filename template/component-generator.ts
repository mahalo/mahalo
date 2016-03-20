import Template from './template';
import {default as Component, setDependency} from '../app/component';
import Parser from '../expression/parser';
import Container from '../app/container';

export default class ComponentGenerator implements Generator {
	node: Node;
	
	attributes: Object;
	
	template: Template;
	
	Component: typeof Component;
	
	children: Array<Generator>;
	
	scope: Object;
	
	constructor(node: Element, desc: {Component?: typeof Component, template?: Template}) {
		this.node = node;
		this.attributes = {};
		
		desc = desc || {};
		
		this.template = desc.template || new Template();
		
		this.Component = desc.Component || Component;
	}
	
	compile(parentNode: DocumentFragment, scope: Component, parentElement: ComponentController) {
		var Component = this.Component;
		
		if (typeof Component.render !== 'function') {
			throw Error('The static method components must be of type function');
		}
		
		var node = this.node.cloneNode(),
			attributes = this.compileAttributes(Component, node, scope),
			link = document.createTextNode(''),
			container;
		
		setDependency(Element, node);
		
		parentNode.appendChild(link);
		
		container = new Container(this.template, this.children, parentElement, link);
		
		Component.render(container, node, scope, attributes);
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
				
				compiledAttributes[attribute] = new Parser(value).compile(scope);
			}
			
			attribute = attributes[++i];
		}
		
		return compiledAttributes;
	}
}
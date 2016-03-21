import ComponentGenerator from './component-generator';
import TextGenerator from './text-generator';
import ChildrenGenerator from './children-generator';

var TEXT_NODE = Node.TEXT_NODE,
	parser = new DOMParser(),
	fragment = document.createDocumentFragment();

fragment.appendChild(document.createElement('children'))

export default class Template {
	components: Object;
	
	attributes: Object;
	
	children: Array<Generator>;
	
	constructor(html?: string, components?: Object, attributes?: Object) {
		this.components = components || {};
		
		this.attributes = attributes || {};
		
		this.children = this.parseChildNodes(parseHTML(html));
	}
	
	parseChildNodes(childNodes: NodeList) {
		var children = [],
			child = childNodes[0],
			i = 0,
			generator;
			
		while (child) {
			generator = this.checkNode(child);
			generator && children.push(generator);
			
			child = childNodes[++i];
		}
		
		return children;
	}
	
	checkNode(node: Node): Generator {
		if (node.nodeType === TEXT_NODE) {
			return this.checkText(node);
		}
		
		var element = node instanceof Element && node;
		
		if (element.tagName === 'CHILDREN') {
			return new ChildrenGenerator(element.cloneNode());
		}
		
		return this.checkComponent(element);
	}
	
	checkText(textNode: Node): TextGenerator {
		if (!textNode.textContent.trim()) {
			return null;
		}
		
		return new TextGenerator(textNode.cloneNode());
	}
	
	checkComponent(element: Element): ComponentGenerator {
		var components = this.components,
			component;
		
		if (components.hasOwnProperty(element.tagName)) {
			component = components[element.tagName];
		}
		
		return this.checkAttributes(element, component);
	}
	
	checkAttributes(element: Element, component): ComponentGenerator {
		var generator = new ComponentGenerator(element, component),
			childNodes = element.childNodes,
			attributes = element.attributes,
			attribute = attributes[0],
			i = 0;
		
		while (attribute) {
			this.checkAttribute(component, attribute, generator);
			
			attribute = attributes[++i];
		}
		
		generator.children = childNodes.length ? this.parseChildNodes(childNodes) : [];
		
		return generator;
	}
	
	checkAttribute(component, attribute, generator) {
		var attributes = this.attributes,
			name = attribute.name;
		
		if (!attributes.hasOwnProperty(name)) {
			return;
		}
		
		// @todo: Check for require
		
		generator.attributes[name] = {
			attribute: attributes[name],
			value: attribute.value
		}
	}
	
	compile(node: Element|DocumentFragment, scope: Component, controller: ComponentController) {
		var children = this.children,
			child = children[0],
			i = 0;
		
		while (child) {
			child.compile(node, scope, controller);
			
			child = children[++i];
		}
	}
}

function parseHTML(html) {
	return parser.parseFromString(html || '', 'text/html').querySelector('body').childNodes;
}
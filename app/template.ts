import ComponentNode from './componentNode';
import TextNode from './textNode';
import EmptyNode from './emptyNode';

var TEXT_NODE = Node.TEXT_NODE,
	parser = new DOMParser(),
	fragment = document.createDocumentFragment();

fragment.appendChild(document.createElement('children'))

export default class Template {	
	components: Object
	
	attributes: Object
	
	children: Array<EmptyNode>
	
	constructor(html?, components?, attributes?) {
		var childNodes = parseHTML(html || '<children/>');
		
		this.components = components || {};
		this.attributes = attributes || {};
		
		this.children = this.parseChildNodes(childNodes);
	}
	
	parseChildNodes(childNodes) {
		var children = [],
			child = childNodes[0],
			i = 0,
			node;
			
		while (child) {
			node = this.checkNode(child);
			node && children.push(node);
			
			child = childNodes[++i];
		}
		
		return children;
	}
	
	checkNode(node) : EmptyNode {
		if (node.nodeType === TEXT_NODE) {
			return this.checkText(node);
		}
		
		if (node.tagName === 'CHILDREN') {
			return new EmptyNode(node.cloneNode());
		}
		
		return this.checkComponent(node);
	}
	
	checkText(textNode) {
		if (!textNode.textContent.trim()) {
			return null;
		}
		
		return new TextNode(textNode.cloneNode());
	}
	
	checkComponent(element) {
		var components = this.components,
			component;
		
		if (components.hasOwnProperty(element.tagName)) {
			component = components[element.tagName];
		}
		
		return this.checkAttributes(element, component);
	}
	
	checkAttributes(element, component) {
		var node = new ComponentNode(element, component),
			childNodes = element.childNodes,
			attributes = element.attributes,
			attribute = attributes[0],
			i = 0;
		
		while (attribute) {
			this.checkAttribute(component, attribute, node);
			
			attribute = attributes[++i];
		}
		
		node.children = childNodes.length ? this.parseChildNodes(childNodes) : [];
		
		return node;
	}
	
	checkAttribute(component, attribute, node) {
		var attributes = this.attributes,
			name = attribute.name;
		
		if (!attributes.hasOwnProperty(name)) {
			return;
		}
		
		// @todo: Check for require
		
		node.attributes[name] = {
			attribute: attributes[name],
			value: attribute.value
		}
	}
	
	compile(node, scope, element) {
		var children = this.children,
			child = children[0],
			i = 0;
		
		while (child) {
			child.compile(node, scope, element);
			
			child = children[++i];
		}
	}
}

function parseHTML(html) {
	if (html) {
		return parser.parseFromString(html, 'text/html').querySelector('body').childNodes;
	}
	
	return fragment.cloneNode(true).childNodes;
}
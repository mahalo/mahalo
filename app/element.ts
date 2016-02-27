export default class Element {
	node: Node
	
	component: Component
		
	constructor(node, component, scope) {
		this.node = node;
		this.component = component;
		this.scope = scope;
		this.children = [];
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
			child.compile(fragment, this.scope, this);
			
			child = children[++i];
		}
		
		parent.replaceChild(fragment, element);
	}
}
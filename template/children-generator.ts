export default class ChildrenGenerator implements Generator {
	node: Node;
	
	constructor(node) {
		this.node = node;
	}
	
	compile(parentNode: DocumentFragment) {
		parentNode.appendChild(this.node.cloneNode());
	}
}
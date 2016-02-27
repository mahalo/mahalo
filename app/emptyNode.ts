export default class EmptyNode {
	node: Node
	
	constructor(node) {
		this.node = node;
	}
	
	compile(node, scope, element) {
		node.appendChild(this.node.cloneNode());
	}
}
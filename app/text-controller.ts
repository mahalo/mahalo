import Expression from '../expression/parser';

export default class TextController implements Controller {
	node: Node;
	
	scope: Component;
	
	parent: ComponentController;
	
	expression: Expression;
	
	constructor(node: Node, scope: Component, parent: ComponentController, text: string|Expression) {
		var exp = text instanceof Expression ? text : null,
			_text = typeof text === 'string' ? text : '';
		
		this.node = node;
		this.scope = scope;
		this.parent = parent;
		this.update = this.update.bind(this);
		
		if (exp) {
			this.expression = exp;
			
			_text = exp.watch(scope, this.update) || '';
		}
		
		node.textContent = _text;
	}
	
	update() {
		this.node.textContent = this.expression.compile(this.scope) || '';
	}
	
	remove() {
		this.parent.children.delete(this);
		
		this.expression && this.expression.unwatch(this.scope, this.update);
	}
}
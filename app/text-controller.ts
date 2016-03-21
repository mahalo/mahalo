import Expression from '../expression/expression';
import Parser from '../expression/parser';

export default class TextController implements Controller {
	node: Node;
	
	parent: ComponentController;
	
	expression: Expression;
	
	update: Function;
	
	constructor(node: Node, scope: Component, parent: ComponentController, text: string|Parser) {
		var _text = typeof text === 'string' && text;
		
		this.node = node;
		this.parent = parent;
		this.update = update.bind(this);
		
		if (text instanceof Parser) {
			this.expression = new Expression(text, scope);
			
			_text = this.expression.watch(this.update) || '';
		}
		
		node.textContent = _text;
	}
	
	remove() {
		this.parent.children.delete(this);
		
		this.expression && this.expression.unwatch(this.update);
	}
}

function update(newValue) {
	this.node.textContent = newValue || '';
}
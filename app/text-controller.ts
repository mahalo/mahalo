import Expression from '../expression/expression';
import Parser from '../expression/parser';

export default class TextController implements Controller {
	node: Node;
	
	parent: ComponentController;
	
	expression: Expression;
	
	update: Function;
	
	constructor(node: Node, scope: Scope|Component, parent: ComponentController, text: string|Parser) {
		var _text = typeof text === 'string' && text,
			expression;
		
		this.node = node;
		this.parent = parent;
		this.update = update.bind(this);
		
		if (text instanceof Parser) {
			expression = this.expression = new Expression(text, scope);
			expression.watch(this.update);
			
			_text = expression.compile() || '';
		}
		
		node.textContent = _text;
	}
	
	remove() {
		this.parent.children.delete(this);
		
		this.node.parentNode.removeChild(this.node);
		
		this.expression && this.expression.unwatch(this.update);
	}
}

function update(newValue) {
	this.node.textContent = newValue || '';
}
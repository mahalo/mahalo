import Element from './element';
import Expression from '../expression/parser';

export default class TextElement extends Element {
	expression: Expression
	
	constructor(node, component, scope, text) {
		super(node, component, scope);
		
		this.update = this.update.bind(this);
		
		if (text instanceof Expression) {
			this.expression = text;
			
			text = text.watch(scope, this.update) || '';
		}
		
		node.textContent = text;
	}
	
	update() {
		this.node.textContent = this.expression.compile(this.scope) || '';
	}
	
	remove() {
		this.expression && this.expression.unwatch(this.scope, this.update);
	}
}
import Expression from '../expression/parser';

export default class TextNode {
	node: Node
	
	parts: Array<any>
	
	constructor(textNode) {
		this.node = textNode;
		
		this.parseText(textNode.textContent);
	}
	
	parseText(text) {
		var parts = [],
			char = text[0],
			i = 0,
			str = '',
			exp;
			
		while (char) {
			if (text[++i] === '{' && char === '$') {
				str && parts.push(str);
				str = '';
				exp = true;
				i++;
			} else if (char === '}' && exp) {
				str = str.trim();
				str && parts.push(new Expression(str));
				str = '';
				exp = false;
			} else {
				str += char;
			}
			
			char = text[i];
		}
		
		str && parts.push(str);
		
		this.parts = parts;
	}
	
	// @todo: add to parent element
	compile(node, scope, element) {
		var textNode = this.node,
			parts = this.parts,
			part = parts[0],
			i = 0;
		
		while (part) {
			if (part instanceof Expression) {
				node.appendChild(this.compileExpression(part, scope));
			} else {
				textNode = textNode.cloneNode();
				textNode.textContent = part;
				node.appendChild(textNode);
			}
			
			part = parts[++i];
		}
	}
	
	compileExpression(exp, scope) {
		var textNode = this.node.cloneNode();
		
		textNode.textContent = exp.compile(scope, function () {
			textNode.textContent = exp.compile(scope) || '';
		}) || '';
		
		return textNode;
	}
}


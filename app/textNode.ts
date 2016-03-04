import Expression from '../expression/parser';
import TextElement from './textElement';
import Component from './component';

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
	
	compile(parentNode, scope, parentElement) {
		var textNode = this.node,
			parts = this.parts,
			part = parts[0],
			i = 0;
		
		while (part) {
			textNode = textNode.cloneNode();
			
			parentNode.appendChild(textNode);
			parentElement.children.push(
				new TextElement(textNode, new Component(), scope, part)
			);
			
			part = parts[++i];
		}
	}
}


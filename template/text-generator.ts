import Expression from '../expression/parser';
import TextController from '../app/text-controller';
import Component from '../app/component';

export default class TextGenerator implements Generator {
	node: Node;
	
	parts: Array<string|Expression>;
	
	constructor(textNode: Node) {
		this.node = textNode;
		
		this.parseText(textNode.textContent);
	}
	
	parseText(text: string) {
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
	
	compile(parentNode: DocumentFragment, scope: Component, parent: ComponentController) {
		var textNode = this.node,
			parts = this.parts,
			part = parts[0],
			i = 0;
		
		while (part) {
			textNode = textNode.cloneNode();
			
			parentNode.appendChild(textNode);
			parent.children.add(
				new TextController(textNode, scope, parent, part)
			);
			
			part = parts[++i];
		}
	}
}
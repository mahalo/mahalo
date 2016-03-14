import Parser from '../expression/parser';
import TextController from '../app/text-controller';
import Component from '../app/component';

export default class TextGenerator implements Generator {
	node: Node;
	
	parts: Array<string|Parser>;
	
	constructor(textNode: Node) {
		this.node = textNode;
		
		this.parseText(textNode.textContent);
	}
	
	parseText(text: string) {
		var parts = [],
			char = text[0],
			i = 0,
			part = '',
			exp;
		
		this.parts = parts;
			
		while (char) {
			if (text[++i] === '{' && char === '$') {
				part && parts.push(part);
				part = '';
				exp = true;
				i++;
			} else if (char === '}' && exp) {
				part = part.trim();
				part && parts.push(new Parser(part));
				part = '';
				exp = false;
			} else {
				part += char;
			}
			
			char = text[i];
		}
		
		part && parts.push(part);
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
import Parser from '../expression/parser';
import TextController from '../app/text-controller';
import Component from '../app/component';

export default class TextGenerator implements Generator {
    node: Node;
    
    parts: Array<string|Parser>;
    
    constructor(textNode: Node) {
        this.node = textNode;
        
        this._parseText(textNode.textContent);
    }
    
    compile(parentNode: DocumentFragment, scope: Scope|Component, parent: ComponentController) {
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
    
    _parseText(text: string) {
        var parts = [],
            char = text[0],
            i = 0,
            part = '',
            nested = 0,
            expression;
        
        this.parts = parts;
            
        while (char) {
            if (text[++i] === '{' && char === '$') {
                part && parts.push(part);
                part = '';
                expression = true;
                i++;
            } else if (char === '{' && expression) {
                nested++;
            } else if (char === '}' && expression) {
                if (nested) {
                    nested--;
                } else {
                    part = part.trim();
                    part && parts.push(new Parser(part));
                    part = '';
                    expression = false;
                }
            } else {
                part += char;
            }
            
            char = text[i];
        }
        
        if (nested) {
            throw Error('Unclosed object literal in expression');
        }
        
        part && parts.push(part);
    }
}
/**
 * This module is responsible for text output.
 */

/***/

import {IGenerator} from './generator';
import Parser from '../expression/parser';
import TextController from '../app/text-controller';
import {Scope, Component, ComponentController} from '../index';

/**
 * The TextGenerator finds output expressions in text nodes
 * of a template and can be used to compile them for view.
 */
export default class TextGenerator implements IGenerator {
    /**
     * The node to clone from.
     */
    node: Node;
    
    /**
     * A list of parts that make up the text content.
     */
    parts: {text: string, expression: boolean}[];
    
    constructor(textNode: Node) {
        this.node = textNode;
        
        this.parseText(textNode.textContent);
    }
    
    /**
     * Compiles the node by creating a [[mahalo/app/text-controller.TextController]]
     * for each of its parts.
     */
    compile(parentNode: DocumentFragment, scope: Scope|Component, parent: ComponentController) {
        let textNode = this.node;
        let parts = this.parts;
        let part = parts[0];
        let i = 0;
        
        while (part) {
            textNode = textNode.cloneNode();
            
            parentNode.appendChild(textNode);
            
            parent.children.add(
                new TextController(textNode, scope, parent, part)
            );
            
            part = parts[++i];
        }
    }
    
    
    //////////
    
    
    /**
     * Parses text content to find output expressions.
     */
    private parseText(text: string) {
        let parts = [];
        let char = text[0];
        let i = 0;
        let part = '';
        let nested = 0;
        let expression;
        
        this.parts = parts;
            
        while (char) {
            if (text[++i] === '{' && char === '$') {
                
                part && parts.push({text: part});
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
                    part && parts.push({text: part, expression: true});
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
        
        part && parts.push({text: part});
    }
}
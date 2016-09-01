/**
 * This module is responsible for binding expression results to text
 * inside the DOM.
 */

/***/

import {IController} from './controller';
import {Component, ComponentController, Scope, Expression} from '../index';
import Parser from '../expression/parser';

/**
 * A controller for text nodes that checks for outputs in the textContent
 * and creates bindings for them.
 */
export default class TextController implements IController {
    node: Node;
    
    parent: ComponentController;
    
    expression: Expression;
    
    update: Function;
    
    constructor(node: Node, scope: Scope|Component, parent: ComponentController, desc: {text: string, expression: boolean}) {
        let text = desc.text;
        
        this.node = node;
        this.parent = parent;
        this.update = update.bind(this);
        
        if (desc.expression) {
            let expression = this.expression = new Expression(text, scope);

            expression.watch(this.update);
            
            text = expression.compile() || '';
        }
        
        node.textContent = text;
    }
    
    remove() {
        this.removeChildren();
        
        this.node.parentNode.removeChild(this.node);
    }
    
    removeChildren() {
        this.parent.children.delete(this);
        
        this.expression && this.expression.unwatch(this.update);
    }
}


//////////


/**
 * A listener for changes of expression results
 */
function update(newValue) {
    this.node.textContent = newValue || '';
}
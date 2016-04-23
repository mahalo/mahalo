/**
 * 
 */

/***/

import {Expression} from '../index';
import Parser from '../expression/parser';

/**
 * 
 */
export default class TextController implements IController {
    node: Node;
    
    parent: IComponentController;
    
    expression: Expression;
    
    update: Function;
    
    constructor(node: Node, scope: IScope|IComponent, parent: IComponentController, desc: {text: string, expression: boolean}) {
        var text = desc.text,
            expression;
        
        this.node = node;
        this.parent = parent;
        this.update = update.bind(this);
        
        if (desc.expression) {
            expression = this.expression = new Expression(text, scope);
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


function update(newValue) {
    this.node.textContent = newValue || '';
}
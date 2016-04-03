import {Expression} from '../index';
import Parser from '../expression/parser';

// @todo: Don't use Parser here
export default class TextController implements Controller {
    node: Node;
    
    parent: ComponentController;
    
    expression: Expression;
    
    update: Function;
    
    constructor(node: Node, scope: Scope|Component, parent: ComponentController, desc: Object) {
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

function update(newValue) {
    this.node.textContent = newValue || '';
}
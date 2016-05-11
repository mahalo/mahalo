/**
 * 
 */

/***/

import {Template, Component, ComponentController} from '../index';
import {setDependency} from '../app/injector';

/**
 * @alias {ComponentGenerator} from mahalo
 */
export default class ComponentGenerator implements IComponentGenerator {
    node: Node;
    
    template: Template;
    
    Constructor: typeof Component;
    
    behaviors: Object;
    
    children: Array<IGenerator>;
    
    constructor(node: Element, desc: {Component?: typeof Component, template?: Template} = {}) {
        var Constructor = desc.Component || Component;
        
        this.node = node;
        this.Constructor = Constructor;
        this.behaviors = {};
        
        if (!('template' in Constructor)) {
            this.template = desc.template;
            return;	
        }
        
        var template = Constructor.template;
        
        if (template instanceof Template) {
            this.template = template;
        } else if (typeof template === 'string') {
            this.template = new Template(template);
        }
    }
    
    compile(parentNode: Element|DocumentFragment, scope: IScope|Component, parent: ComponentController) {
        var Constructor = this.Constructor,
            node = this.node,
            element = node instanceof Element && node,
            controller;
            
        node = node.cloneNode(element.tagName === 'PRE'),
        element = node instanceof Element && node;
        
        setDependency(ComponentGenerator, this);
        
        controller = new ComponentController(Constructor, element, scope, parent, Constructor.locals);
        
        controller.init(parentNode, this.children, this.behaviors, this.template);
    }
}
/**
 * This module is responsible for generating components.
 */

/***/

import {IGenerator} from './generator';
import {Scope, Template, Component, ComponentController} from '../index';
import {setDependency} from '../app/injector';

/**
 * The ComponentGenerator hold information about a node from
 * a template. It can be used to create component instances
 * for a certain scope and parent.
 * 
 * @alias {ComponentGenerator} from mahalo
 */
export default class ComponentGenerator implements IGenerator {
    /**
     * The node to clone from.
     */
    node: Node;
    
    /**
     * The template that components will use.
     */
    template: Template;
    
    /**
     * The constructor function of the component.
     */
    Constructor: typeof Component;
    
    /**
     * A map of behaviors that the component will use.
     */
    behaviors: Object;
    
    /**
     * A list of children that will be created inside
     * of the template's children element.
     */
    children: IGenerator[];
    
    constructor(node: Element, desc: {Component?: typeof Component, template?: Template} = {}) {
        let Constructor = desc.Component || Component;
        
        this.node = node;
        this.Constructor = Constructor;
        this.behaviors = {};
        
        if (!('template' in Constructor)) {
            this.template = desc.template;
            return;	
        }
        
        let template = Constructor.template;
        
        if (template instanceof Template) {
            this.template = template;
        } else if (typeof template === 'string') {
            this.template = new Template(template);
        }
    }
    
    /**
     * Compiles the node in a given scope and appends it to
     * a parent node as well as the parent controller.
     */
    compile(parentNode: Element|DocumentFragment, scope: Scope|Component, parent: ComponentController) {
        let Constructor = this.Constructor;
        let node = this.node;
            
        node = node.cloneNode(/^(PRE|SCRIPT|TEXTAREA)$/.test((<Element>node).tagName));
        
        setDependency(ComponentGenerator, this);
        
        let controller = new ComponentController(Constructor, <Element>node, scope, parent, Constructor.locals);
        
        controller.init(parentNode, this.children, this.behaviors, this.template);
    }
}
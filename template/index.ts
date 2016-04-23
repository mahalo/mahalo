/**
 * 
 */

/***/

import {config} from '../index';

// Generators
import {ComponentGenerator} from '../index';
import TextGenerator from './text-generator';
import ChildrenGenerator from './children-generator';

// Components
import {Show, For, Route, Anchor, Form} from '../index';

// Behaviors
import EventBehavior from '../behaviors/event-behavior';
import AttributeBehavior from '../behaviors/attribute-behavior';
import {Classes, Styles, Content, Model, Link} from '../index';

/**
 * @alias {Template} from mahalo
 */
export default class Template implements ITemplate {
    components: Object;
    
    behaviors: Object;
    
    children: Array<IGenerator>;
    
    constructor(html?: string, components?: Object, behaviors?: Object) {
        this.components = components || {};
        
        this.behaviors = behaviors || {};
        
        this.children = this._parseChildNodes(parseHTML(html));
    }
    
    compile(parentNode: Element|DocumentFragment, scope: IScope|IComponent, controller: IComponentController) {
        var children = this.children,
            child = children[0],
            i = 0;
        
        while (child) {
            child.compile(parentNode, scope, controller);
            
            child = children[++i];
        }
    }
    
    
    //////////
    
    
    _parseChildNodes(childNodes: NodeList) {
        var children: Array<IGenerator> = [],
            child = childNodes[0],
            i = 0,
            generator;
            
        while (child) {
            generator = this._checkNode(child);
            generator && children.push(generator);
            
            child = childNodes[++i];
        }
        
        return children;
    }
    
    _checkNode(node: Node): IGenerator {
        if (node.nodeType === TEXT_NODE) {
            return this._checkText(node);
        }
        
        var element = node instanceof Element && node;
        
        if (!element) {
            return;
        }
        
        if (element.tagName === 'CHILDREN') {
            return new ChildrenGenerator(element.cloneNode());
        }
        
        return this._checkComponent(element);
    }
    
    _checkText(textNode: Node) {
        if (!textNode.textContent.trim()) {
            return;
        }
        
        return new TextGenerator(textNode.cloneNode());
    }
    
    _checkComponent(element: Element) {
        var name = element.tagName,
            components = this.components,
            component;
        
        if (name === 'PRE') {
            return new ComponentGenerator(element, {});
        }
        
        if (components.hasOwnProperty(name)) {
            
            component = components[name];
            
        } else if (name === config.FOR_TAG) {
            
            component = {Component: For};
            
        } else if (name === config.SHOW_TAG) {
            
            component = {Component: Show};
            
        } else if (name === config.ROUTE_TAG) {
            
            component = {Component: Route};
            
        } else if (name === 'FORM') {
            
            component = {Component: Form};
            
        } else if (name === 'A') {
            
            component = {Component: Anchor};
            
        }
        
        return this._checkBehaviors(element, component);
    }
    
    _checkBehaviors(element: Element, component: Object) {
        var childNodes = element.childNodes,
            generator = new ComponentGenerator(element, component),
            attributes = element.attributes,
            attribute = attributes[0],
            i = 0;
        
        while (attribute) {
            this._checkBehavior(attribute, generator);
            
            attribute = attributes[++i];
        }
        
        generator.children = childNodes.length ? this._parseChildNodes(childNodes) : [];
        
        return generator;
    }
    
    _checkBehavior(attribute: Attr, generator: ComponentGenerator) {
        var behaviors = this.behaviors,
            name = attribute.name,
            Behavior;
        
        // @todo: Add attribute push behavior before 1.0
        if (/^@/.test(name)) {
            Behavior = EventBehavior;
        } else if (/^#/.test(name)) {
            Behavior = AttributeBehavior;
        } else if (behaviors.hasOwnProperty(name)) {
            Behavior = behaviors[name];
        } else if (name === config.CLASSES_ATTRIBUTE) {
            Behavior = Classes;
        } else if (name === config.STYLES_ATTRIBUTE) {
            Behavior = Styles;
        } else if (name === config.CONTENT_ATTRIBUTE) {
            Behavior = Content;
        } else if (name === config.MODEL_ATTRIBUTE) {
            Behavior = Model;
        } else if (name === config.LINK_ATTRIBUTE) {
            Behavior = Link;
        }
        
        if (!Behavior) {
            return;
        }
        
        generator.behaviors[name] = {
            Behavior: Behavior,
            value: attribute.value
        }
    }
}


//////////


var TEXT_NODE = Node.TEXT_NODE;

/**
 * 
 */
function parseHTML(html: string) {
    var container = document.createElement('div');
    
    html && (container.innerHTML = html);
    
    return container.childNodes;
}
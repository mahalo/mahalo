import config from '../config';

import ComponentGenerator from './component-generator';
import TextGenerator from './text-generator';
import ChildrenGenerator from './children-generator';

import Show from '../components/show';
import For from '../components/for';
import Route from '../components/route';
import Form from '../components/form';

import EventBehavior from '../behaviors/event-behavior';
import AttributeBehavior from '../behaviors/attribute-behavior';
import Classes from '../behaviors/classes';
import Styles from '../behaviors/styles';
import Content from '../behaviors/content';
import Model from '../behaviors/model';
import RouteBehavior from '../behaviors/route';

var TEXT_NODE = Node.TEXT_NODE;

export default class Template {
    components: Object;
    
    behaviors: Object;
    
    children: Array<Generator>;
    
    constructor(html?: string, components?: Object, behaviors?: Object) {
        this.components = components || {};
        
        this.behaviors = behaviors || {};
        
        this.children = this._parseChildNodes(parseHTML(html));
    }
    
    compile(node: Element|DocumentFragment, scope: Scope|Component, controller: ComponentController) {
        var children = this.children,
            child = children[0],
            i = 0;
        
        while (child) {
            child.compile(node, scope, controller);
            
            child = children[++i];
        }
    }
    
    _parseChildNodes(childNodes: NodeList) {
        var children: Array<Generator> = [],
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
    
    _checkNode(node: Node): Generator {
        if (node.nodeType === TEXT_NODE) {
            return this._checkText(node);
        }
        
        var element = node instanceof Element && node;
        
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
        
        if (components.hasOwnProperty(element.tagName)) {
            component = components[element.tagName];
        } else if (name === config.FOR_TAG) {
            component = {Component: For};
        } else if (name === config.SHOW_TAG) {
            component = {Component: Show};
        } else if (name === config.ROUTE_TAG) {
            component = {Component: Route};
        } else if (name === 'FORM') {
            component = {Component: Form};
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
        
        if (/^@/.test(name)) {
            Behavior = EventBehavior;
        } else if (/^#/.test(name)) {
            Behavior = AttributeBehavior;
        } else if (behaviors.hasOwnProperty(name)) {
            Behavior = behaviors[name];
        } else if (name === 'classes') {
            Behavior = Classes;
        } else if (name === 'styles') {
            Behavior = Styles;
        } else if (name === 'content') {
            Behavior = Content;
        } else if (name === 'model') {
            Behavior = Model;
        } else if (name === 'route') {
            Behavior = RouteBehavior;
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

function parseHTML(html: string) {
    var container = document.createElement('div');
    
    container.innerHTML = html || '';
    
    return container.childNodes;
}
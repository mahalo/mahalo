import {Scope, Component, Template, unwatch} from '../index';
import {setDependency} from './injector';
import enter from '../animation/enter';
import leave from '../animation/leave';

export default class ComponentController implements Controller {
    node: Element|DocumentFragment;
    
    scope: Scope|Component;
    
    locals: Array<string>;
    
    localScope: Scope|Component;
    
    parent: ComponentController;
    
    component: Component;
    
    behaviors: Set<Behavior>;
    
    children: Set<Controller>;
    
    compiled: boolean;
    
    position: number;
    
    isEntering: boolean;
    
    isLeaving: boolean;
    
    constructor(Constructor, node: Element|DocumentFragment, scope: Scope|Component, parent?: ComponentController, locals?: Array<string>) {
        this.node = node;
        this.parent = parent;
        this.children = new Set();
        this.scope = scope;
        this.position = 1;
        
        // Set dependencies
        setDependency(Element, node);
        setDependency(Scope, scope);
        setDependency(ComponentController, this);
        
        this.component = new Constructor();
        this.behaviors = new Set();
        this.locals = locals;	
    }
    
    init(parentNode: Element|DocumentFragment, children: Array<Generator>, behaviors: Object, template?: Template) {
        var component = this.component,
            scope = this.scope,
            locals = this.locals,
            node = this.node,
            useScope = Object.getPrototypeOf(component) === Component.prototype;
        
        template = template || new Template('<children></children>');
        
        template.compile(node, useScope ? scope : component, this);
        
        this.localScope = locals ? new Scope(scope, component, locals) : scope;
        
        this._compileChildren(children);
        
        this.parent.children.add(this);
        
        this.append(parentNode);
        
        // Set dependencies
        setDependency(Element, node);
        setDependency(Scope, this.localScope);
        setDependency(ComponentController, this);
        setDependency(Component, component);
        
        this._initBehaviors(behaviors);
        
        component.ready();
    }
    
    append(parentNode: Element|DocumentFragment) {
        if (parentNode instanceof Element && this.node instanceof Element) {
            return enter(this, parentNode);
        }
        
        this.compiled = true;
        
        parentNode.appendChild(this.node);
    }
    
    detach() {
        if (this.node instanceof Element) {
            return leave(this);
        }
        
        this.remove();
    }
    
    remove() {
        var	node = this.node;
        
        this.removeChildren();
        
        node.parentNode && node.parentNode.removeChild(node);
    }
    
    removeChildren() {
        var component = this.component;
        
        unwatch(component);
        
        typeof component.remove === 'function' && component.remove();
        
        if (this.node.parentNode) {
            this.children.forEach(controller => controller.removeChildren());
        } else {
            this.children.forEach(controller => controller.remove());
        }
        
        this.parent.children.delete(this);
        
        this.behaviors.forEach(behavior => behavior.remove());
    }
    
    _compileChildren(children) {
        var node = this.node,
            element = node instanceof Element && node,
            container = node.querySelector('children');
        
        if (!container || element.tagName === 'PRE') {
            return;
        }
        
        var parent = container.parentNode,
            fragment = document.createDocumentFragment(),
            child = children[0],
            i = 0;
        
        while (child) {
            // Set dependency
            setDependency(Component, this.component);
            
            child.compile(fragment, this.localScope, this);
            
            child = children[++i];
        }	
        
        parent.replaceChild(fragment, container);
    }
    
    _initBehaviors(behaviors: Object) {
        var names = Object.keys(behaviors),
            i = names.length,
            name,
            desc,
            Behavior;
        
        while (i--) {
            name = names[i];
            desc = behaviors[name],
            Behavior = desc.Behavior;
                
            this.behaviors.add(new Behavior(desc.value, name));
        }
    }
}
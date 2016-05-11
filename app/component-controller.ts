/**
 * This module is responsible for dealing with component's
 * controllers.
 */

/***/

import {Scope, Component, Template, unwatch} from '../index';
import {removeAttributeBindings} from './component';
import {removeBinding} from './behavior';
import {setDependency} from './injector';
import enter from '../animation/enter';
import leave from '../animation/leave';

/**
 * This class is mainly working behind the scenes. Every component in
 * a Mahalo application has its controller. The controller is responsible
 * for knowing how a component relates to other components and also
 * for managing its attached behaviors.
 * 
 * The most common use for this class is to inject the correct controller
 * into a [[mahalo.Component]] or a [[mahalo.Behavior]]. You can then use
 * it to traverse the tree of controllers and find relevant parents or
 * children.
 * 
 * You can also use it to create children inside of your component on the fly.
 * Have a look at the source of [[mahalo.Show]] for a simple example of this.
 * 
 * @alias {ComponentController} from mahalo
 */
export default class ComponentController implements IComponentController {
    /**
     * The defining element of the template.
     */
    node: Element|DocumentFragment;
    
    /**
     * The scope inside which the component was defined.
     */
    scope: Scope|Component;
    
    /**
     * The keys that should be available in the local scope.
     */
    locals: Array<string>;
    
    /**
     * The controller's localScope.
     */
    localScope: Scope|Component;
    
    /**
     * The parent controller.
     */
    parent: ComponentController;
    
    /**
     * The component instance of the controller.
     */
    component: Component;
    
    /**
     * The component's behaviors.
     */
    behaviors: Set<IBehavior>;
    
    /**
     * The child controllers.
     */
    children: Set<IController>;
    
    /**
     * A flag that indicates if the controller was already compiled.
     */
    compiled: boolean;
    
    /**
     * The current postion of the controller inside its parent.
     */
    position: number;
    
    /**
     * This flag indicates if the controller is currently running its entering animation.
     */
    isEntering: boolean;
    
    /**
     * This flag indicates if the controller is currently running its leaving animation.
     */
    isLeaving: boolean;
    
    /**
     * Prepares the controler for beeing initialized. This means it will set the correct
     * dependencies for injection and create the component.
     */
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
    
    /**
     * This method will create the local scope, compile the controller's children
     * with the correct dependencies and after that initialize the controller's
     * behaviors.
     */
    init(parentNode: Element|DocumentFragment, children: Array<IGenerator>, behaviors: Object, template?: Template) {
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
        
        typeof component['ready'] === 'function' && component['ready']();
    }
    
    /**
     * Appends the controller's element to the DOM and performs an
     * optional entering animation.
     */
    append(parentNode: Element|DocumentFragment) {
        if (parentNode instanceof Element && this.node instanceof Element) {
            return enter(this, parentNode);
        }
        
        this.compiled = true;
        
        parentNode.appendChild(this.node);
    }
    
    /**
     * Runs an optional leaving animation and executes the remove method.
     */
    detach() {
        if (this.node instanceof Element) {
            return leave(this);
        }
        
        this.remove();
    }
    
    /**
     * Removes all bindings that were made by the controller's component or its children
     * and removes the controller's element from the DOM.
     */
    remove() {
        var	node = this.node;
        
        this.removeChildren();
        
        node.parentNode && node.parentNode.removeChild(node);
    }
    
    /**
     * Recursively destroys the controller's children.
     */
    removeChildren() {
        var component = this.component;
        
        unwatch(component);
        
        removeAttributeBindings(component);
        
        typeof component['remove'] === 'function' && component['remove']();
        
        if (this.node.parentNode) {
            this.children.forEach(controller => controller.removeChildren());
        } else {
            this.children.forEach(controller => controller.remove());
        }
        
        this.parent.children.delete(this);
        
        this.behaviors.forEach(behavior => {
            unwatch(behavior);
            
            removeBinding(behavior);
            
            typeof behavior.remove === 'function' && behavior.remove();
        });
    }
    
    
    //////////
    
    
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
/**
 * This module contains the Show component.
 */

/***/

import {Component, ComponentController, ComponentGenerator} from '../index';
import enter from '../animation/enter';
import asap from '../utils/asap';

/**
 * The Show component shows or hides its content depending
 * on the evaluation of an expression defined in the **if**
 * attribute.
 * 
 * ### Example
 * 
 * This simple example only shows a user item when the property
 * **isMember** of an object **user** from the local scope is truthy.
 * 
 * ```html
 * <show if="user.isMember">
 *     <h3>${ user.fullName }</h3>
 * </show>
 * ```
 * 
 * @alias {Show} from mahalo
 */
export default class Show extends Component {
    static inject = {
        element: Element,
        generator: ComponentGenerator,
        controller: ComponentController
    };
    
    static attributes = {if: '.'};
    
    static bindings = {if: 'update'};
    
    static template = '';
    
    /**
     * The component's element.
     */
    element: Element;
    
    /**
     * The generator used to create the component.
     */
    generator: ComponentGenerator;
    
    /**
     * The controller of the component.
     */
    controller: ComponentController;
    
    /**
     * The current result of the expression.
     */
    if: boolean;
    
    /**
     * The child controller that is shown or hidden.
     */
    child: ComponentController;
    
    constructor() {
        super();
        
        asap(() => this.update(this.if));
    }
    
    /**
     * Removes or appends the content when the expression result has changed.
     */
    update(value) {
        if (value) {
            return this._createController();
        }
        
        this.child && this.child.detach();
        this.child = null;
    }
    
    
    //////////
    
    
    _createController() {
        var controller = this.controller,
            element = document.createDocumentFragment(),
            childController = new ComponentController(Component, element, controller.scope, controller);
        
        enter(controller, controller.parent.node, true);
        
        childController.init(this.element, this.generator.children, {});
        
        return this.child = childController;
    }
}
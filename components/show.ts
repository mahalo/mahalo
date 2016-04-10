/**
 * 
 */

/***/

import {Component, ComponentController, ComponentGenerator} from '../index';
import enter from '../animation/enter';
import asap from '../utils/asap';

/**
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
    
    element: Element;
    
    generator: ComponentGenerator;
    
    controller: ComponentController;
    
    if: boolean;
    
    child: ComponentController;
    
    constructor() {
        super();
        
        asap(() => this.update(this.if));
    }
    
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
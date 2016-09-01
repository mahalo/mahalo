/**
 * The module hold the For component for looping over objects.
 */

/***/

import {Component, ComponentController, ComponentGenerator, assign} from '../index';

/**
 * The For component can be used to loop over objects inside of templates.
 * It creates a new local variable available for every iteration. It can be
 * defined in the **each** attribute. The object to loop over is retrieved
 * from evaluating the expression defined in the **of** attribute.
 * 
 * In the local scope of each item there are also two special properties
 * available: **$index** and **$key**. The names speak for themselves.
 * 
 * ### Example
 * 
 * A simple example that loops over a list of users.
 * 
 * ```html
 * <for each="user" of="users">
 *     <user>
 *         <h3>${ user.name }</h3>
 *     </user>
 * </for>
 * ```
 * 
 * @alias {For} from mahalo
 */
export default class For extends Component {
    static inject = {
        element: Element,
        generator: ComponentGenerator,
        controller: ComponentController
    };
    
    static attributes = {each: '', of: '.'};
    
    static bindings = {of: 'update'};
    
    static template = '';
    
    /**
     * The component's element.
     */
    element: Element;
    
    /**
     * The component's controller.
     */
    controller: ComponentController;
    
    /**
     * The generator used to create the component.
     */
    generator: ComponentGenerator;
    
    /**
     * The name of the local property.
     */
    each: string;
    
    /**
     * The object that is looped over.
     */
    of: Object|any[];
    
    /**
     * The template for creating items.
     */
    template: Element;
    
    /**
     * A list of child controllers created for each item curently
     * in the list.
     */
    children: ComponentController[];
    
    constructor() {
        super();
        
        let template = document.createElement(this.each);
        let attributes = this.element.attributes;
        let attribute = attributes[0];
        let i = 0;
        
        while (attribute) {
            let name = attribute.name;
            
            name === 'each' || name === 'of' || template.setAttribute(name, attribute.value);
            attribute = attributes[++i];
        }
        
        this.template = template;
        
        this.children = [];
        
        this.update(this.of);
    }
    
    /**
     * Updates the DOM when the list of items has changed.
     */
    update(obj) {
        this.controller.children.forEach(
            (controller: ComponentController) => controller.isLeaving && controller.remove()
        );
        
        if (Array.isArray(obj)) {
            return this.prepareArray(obj);
        }
        
        if (obj instanceof Object) {
            return this.prepareObject(obj);
        }
    }
    
    
    //////////
    
    
    private prepareArray(arr: any[]) {
        let children = [];
        let len = arr.length;
        let i = 0;
        
        while (i < len) {
            children.push(this.hasPrevious(arr, i, i++));
        }
        
        this.setPrevious(children);
    }
    
    private prepareObject(obj: Object) {
        let children = [];
        let keys = Object.keys(obj);
        let len = keys.length;
        let i = 0;
        
        while (i < len) {
            children.push(this.hasPrevious(obj, keys[i], i++));
        }
        
        this.setPrevious(children);
    }
    
    private hasPrevious(obj, key, i) {
        let children = this.children;
        let each = this.each;
        let value = obj[key];
        let j = 0;
        let controller;
            
        while (controller = children[j++]) {
            if (controller.component[each] === value) {
                break;
            }
        }
        
        if (controller) {
            children.splice(children.indexOf(controller), 1);
            
            let component = controller.component;
                        
            assign(component, '$key', key);
            assign(component, '$index', i);
            controller.append(this.element);
        } else {
            controller = this.createController(obj, key, i);
        }
        
        return controller;
    }

    private setPrevious(children: ComponentController[]) {
        let len = children.length;
        
        this.children.reverse();
        this.children.forEach(controller => controller.detach());
        this.children = children;
        
        children.forEach((controller, i) => controller.position = len - i);
    }
    
    private createController(obj: Object, key: string|number, index: number) {
        let each = this.each;
        let controller = this.controller;
        let generator = this.generator;
        let itemController = new ComponentController(
            Component,
            <Element>this.template.cloneNode(),
            controller.scope,
            controller,
            [each, '$key', '$index']
        );
        let component = itemController.component;
        
        component[each] = obj[key];
        component['$key'] = key;
        component['$index'] = index;
        
        itemController.init(this.element, generator.children, generator.behaviors);
        
        return itemController;
    }
}
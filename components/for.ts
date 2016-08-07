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
    of: Object|Array<any>;
    
    /**
     * The template for creating items.
     */
    template: Element;
    
    /**
     * A list of child controllers created for each item curently
     * in the list.
     */
    children: Array<ComponentController>;
    
    constructor() {
        super();
        
        var template = document.createElement(this.each),
            attributes = this.element.attributes,
            attribute = attributes[0],
            i = 0,
            name;
        
        while (attribute) {
            name = attribute.name;
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
            return this._prepareArray(obj);
        }
        
        if (obj instanceof Object) {
            return this._prepareObject(obj);
        }
    }
    
    
    //////////
    
    
    _prepareArray(arr: Array<any>) {
        var children = [],
            len = arr.length,
            i = 0;
        
        while (i < len) {
            children.push(this._hasPrevious(arr, i, i++));
        }
        
        this._setPrevious(children);
    }
    
    _prepareObject(obj: Object) {
        var children = [],
            keys = Object.keys(obj),
            len = keys.length,
            i = 0;
        
        while (i < len) {
            children.push(this._hasPrevious(obj, keys[i], i++));
        }
        
        this._setPrevious(children);
    }
    
    _hasPrevious(obj, key, i) {
        var children = this.children,
            each = this.each,
            value = obj[key],
            controller = children.find(
                childController => childController.component[each] === value
            );
        
        if (controller) {
            children.splice(children.indexOf(controller), 1);
            
            var component = controller.component;
                        
            assign(component, '$key', key);
            assign(component, '$index', i);
            controller.append(this.element);
        } else {
            controller = this._createController(obj, key, i);
        }
        
        return controller;
    }

    _setPrevious(children: Array<ComponentController>) {
        var len = children.length;
        
        this.children.reverse();
        this.children.forEach(controller => controller.detach());
        this.children = children;
        
        children.forEach((controller, i) => controller.position = len - i);
    }
    
    _createController(obj: Object, key: string|number, index: number) {
        var each = this.each,
            element = this.template.cloneNode(),
            controller = this.controller,
            generator = this.generator,
            itemController = new ComponentController(
                Component,
                element instanceof Element && element,
                controller.scope,
                controller,
                [each, '$key', '$index']
            ),
            component = itemController.component;
        
        component[each] = obj[key];
        component['$key'] = key;
        component['$index'] = index;
        
        itemController.init(this.element, generator.children, generator.behaviors);
        
        return itemController;
    }
}
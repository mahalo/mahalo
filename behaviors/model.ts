/**
 * This module exports the Model behavior.
 */

/***/

import {Component, ComponentController, Behavior, assign, keyPath} from '../index';
import Form from '../components/form';

// @todo: Add more validators
const isNumber = /^\s*\d+(\.\d+)?\s*$/;
const isEmail = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

/**
 * The Model behavior connects a component to a parent [[mahalo.Form]].
 * It also sets up a two way binding to the path inside the local scope
 * that is defined in the attribute's value.
 * 
 * Native form elements are working with form validation out of the box.
 * 
 * For custom components that should hook into the form validation your
 * implementation must set the **value** property of the component instance
 * every time the model's value should change. Of course a change in the
 * model's value will update the **value** property.
 * 
 * ### Example
 * 
 * ```html
 * <input name="username" type="text" model="username"/>
 * <input name="email" type="email" model="email"/>
 * <input name="birthday" type="date" model="birthday"/>
 * <input name="rating" type="number" model="rating"/>
 * <select name="suggestion" model="suggestion">
 *     <option>Yes</option>
 *     <option>No</option>
 * </select>
 * ```
 * 
 * @alias {Model} from mahalo
 */
export default class Model extends Behavior {
    static inject = {
        element: Element,
        controller: ComponentController,
        component: Component,
        form: Form
    };
    
    static update = 'update';
    
    static bindings = {
        'component.value': 'updateModel'
    };
    
    /**
     * The element the behavior was attached to.
     */
    element: Element;
    
    /**
     * The component the behavior belongs to.
     */
    component: Component;
    
    /**
     * The controller of the behavior's component.
     */
    controller: ComponentController;
    
    /**
     * The form that the model belongs to.
     */
    form: Form;
    
    /**
     * The key path to the model's value.
     */
    path: string;
    
    /**
     * The field name that is used in the form.
     */
    name: string;
    
    /**
     * A flag that indicates that a change to the model
     * was triggered internally.
     */
    skip: boolean;
    
    constructor(path: string) {
        super(path);
        
        let element = this.element;
        let component = this.component;
        let form = this.form;
        let scope = this.controller.localScope;
        let value = keyPath(scope, path);
        let name = element.getAttribute('name');
        
        this.path = path;
        this.name = name;
        this.skip = true;
        
        if (name && form) {
            form.$fields[name] = {
                validators: []
            };
            
            form.setValue(name, value);
        }
        
        this.initElement(value);
        
        component['value'] = value;
    }
    
    /**
     * Updates the value property of the component
     * whenever the modal has changed.
     */
    update(value) {
        this.skip = !this.skip;
        
        if (!this.skip) {
            return;
        }
        
        let input = getInput(this.element);
        
        this.component['value'] = value;
        
        input && (input.value = value || '');
    }
    
    /**
     * Updates the model's value whenever the property of
     * the component has changed.
     */
    updateModel(value) {
        let form = this.form;
        let name = this.name;
        
        this.skip = !this.skip;
        
        if (!this.skip || form && name && !form.setValue(name, value)) {
            return;
        }
        
        keyPath(this.controller.localScope, this.path, value);
    }
    
    
    //////////
    
    
    /**
     * Initializes native form elements by adding
     * required validators.
     */
    private initElement(value) {
        let element = this.element;
        let form = this.form;
        let input = getInput(element);
        
        if (!input) {
            return;
        }
        
        input.addEventListener('input', event => {
            assign(this.component, 'value', input.value);
        });
        
        input.value = value || '';
        
        if (!form || !this.name) {
            return;
        }
        
        let validators = form.$fields[this.name].validators;
        
        switch(input.type) {
            case 'number':
            case 'range':
                return validators.push(numberValidator);
                
            case 'email':
                return validators.push(emailValidator);
                
            case 'date':
                return validators.push(dateValidator);
        }
    }
}


//////////


function getInput(element: Element) {
    return (
        element instanceof HTMLInputElement ||
        element instanceof HTMLSelectElement ||
        element instanceof HTMLTextAreaElement
    ) && element;
}

function numberValidator(value: string) {
    return isNumber.test(value);
}

function emailValidator(value: string) {
    return isEmail.test(value);
}

function dateValidator(value: string) {
    let date = new Date(value);
    let dateString = [
        pad(date.getFullYear(), 4),
        pad(date.getMonth() + 1, 2),
        pad(date.getDate(), 2)
    ].join('-');
    
    return dateString === value; 
}

function pad(value: string|number, length: number) {
    value = value + '';
    length -= (<string>value).length;
    
    while (length--) {
        value = '0' + value;
    }
    
    return <string>value;
}
/**
 * 
 */

/***/

import {Component, ComponentController, Behavior, assign, keyPath} from '../index';
import Form from '../components/form';

/**
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
    
    element: Element;
    
    component: Component;
    
    controller: ComponentController;
    
    form: Form;
    
    path: string;
    
    name: string;
    
    skip: boolean;
    
    constructor(path: string) {
        super(path);
        
        var element = this.element,
            component = this.component,
            form = this.form,
            scope = this.controller.localScope,
            value = keyPath(scope, path),
            name = element.getAttribute('name');
        
        this.path = path;
        this.name = name;
        this.skip = true;
        
        if (name && form) {
            form.$fields[name] = {
                validators: []
            };
            
            form.setValue(name, value);
        }
        
        this._initElement(value);
        
        component['value'] = value;
    }
    
    update(value) {
        this.skip = !this.skip;
        
        if (!this.skip) {
            return;
        }
        
        var input = getInput(this.element);
        
        this.component['value'] = value;
        
        input && (input.value = value || '');
    }
    
    updateModel(value) {
        var form = this.form,
            name = this.name;
        
        this.skip = !this.skip;
        
        if (!this.skip || form && name && !form.setValue(name, value)) {
            return;
        }
        
        keyPath(this.controller.localScope, this.path, value);
    }
    
    
    //////////
    
    
    _initElement(value) {
        var element = this.element,
            form = this.form,
            input = getInput(element),
            validators;
        
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
        
        validators = form.$fields[this.name].validators;
        
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


// @todo: Add more validators
var NUMBER = /^\s*\d+(\.\d+)?\s*$/,
    EMAIL = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

function getInput(element: Element) {
    return (
        element instanceof HTMLInputElement ||
        element instanceof HTMLSelectElement ||
        element instanceof HTMLTextAreaElement
    ) && element;
}

function numberValidator(value: string) {
    return NUMBER.test(value);
}

function emailValidator(value: string) {
    return EMAIL.test(value);
}

function dateValidator(value: string) {
    var date = new Date(value),
        dateString = [
            pad(date.getFullYear(), 4),
            pad(date.getMonth() + 1, 2),
            pad(date.getDate(), 2)
        ].join('-');
    
    return dateString === value; 
}

function pad(value, amount) {
    var str = value + '',
        i = 0;
    
    amount -= str.length;
    
    while (i++ < amount) {
        str = '0' + str;
    }
    
    return str;
}
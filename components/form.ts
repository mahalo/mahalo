/**
 * This module is responsible for forms.
 */

/***/

import {Component, ComponentController} from '../index';

/**
 * The Form component provides simple validation for
 * form field components.
 * 
 * @alias {Form} from mahalo
 */
export default class Form extends Component {
    static inject = {element: Element};
    
    static locals = ['$fields', '$valid', '$dirty'];
    
    element: Element;
    
    /**
     * A map of fields used in this form.
     */
    $fields = {};
    
    /**
     * A flag that indicates if the form is currently valid.
     */
    $valid = true;
    
    /**
     * A flag that indicated if the form has been changed.
     */
    $dirty = false;
    
    /**
     * An interceptor for the submit event that prevents invalid
     * forms from beeing submited.
     */
    submit: EventListener;
    
    constructor() {
        super();
        
        this.submit = event => {
            if (this.$valid) {
                return;
            }
            
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        };
        
        this.element.addEventListener('submit', this.submit);
    }
    
    remove() {
        this.element.removeEventListener('submit', this.submit);
    }
    
    /**
     * Updates the value of field.
     */
    setValue(name: string, value) {
        if (!this.validateField(name, value)) {
            return false;
        }
        
        let field = this.$fields[name];
        
        if ('value' in field) {
            this.$dirty = true;
        }
        
        field.value = value;
        
        this.validateForm();
        
        return true;
    }
    
    
    //////////
    
    
    private validateField(name: string, value) {
        let field = this.$fields[name];
        let valid = true;
        
        field.validators.forEach(validator => {
            valid = validator(value);
        });
        
        return field.valid = valid;
        
    }
    
    private validateForm() {
        let fields = this.$fields;
        let names = Object.keys(fields);
        let i = names.length;
        let valid = true;
        
        while (i--) {
            if (!fields[names[i]].valid) {
                valid = false;
                i = 0;
            }
        }
        
        this.$valid = valid;
    }
}
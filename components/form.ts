import {Component, ComponentController} from '../index';

export default class Form extends Component {
    static inject = {element: Element};
    
    static locals = ['$fields', '$valid', '$dirty'];
    
    element: Element;
    
    $fields = {};
    
    $valid = true;
    
    $dirty = false;
    
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
    
    setValue(name: string, value) {
        if (!this._validateField(name, value)) {
            return false;
        }
        
        var field = this.$fields[name];
        
        if ('value' in field) {
            this.$dirty = true;
        }
        
        field.value = value;
        
        this._validateForm();
        
        return true;
    }
    
    _validateField(name: string, value) {
        var field = this.$fields[name],
            valid = true;
        
        field.validators.forEach(validator => {
            valid = validator(value);
        });
        
        return field.valid = valid;
        
    }
    
    _validateForm() {
        var fields = this.$fields,
            names = Object.keys(fields),
            i = names.length,
            valid = true,
            name;
        
        while (i--) {
            if (!fields[names[i]].valid) {
                valid = false;
                i = 0;
            }
        }
        
        this.$valid = valid;
    }
}
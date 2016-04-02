import Behavior from '../app/behavior';

export default class AttributeBehavior extends Behavior {
    static inject = {
        element: Element
    };
    
    static bind = 'update';
    
    element: Element;
    
    name: string;
    
    constructor(value, name) {
        super(value);
        
        this.name = name.substr(1);
    }
    
    update(newValue) {
        this.element.setAttribute(this.name, newValue || '');
    }
}
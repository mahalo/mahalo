import ComponentGenerator from '../template/component-generator';
import ComponentController from './component-controller';

import Scope from './scope';
import Expression from '../expression/expression';
import {watch} from '../change-detection/watch';
import assign from '../change-detection/assign';
import {injectDependencies, getDependency} from './injector';

export default class Component {
    static locals: Object;
    
    static inject: Object;
    
    static attributes: Object;
    
    static bindings: Object;
    
    static template: string|Template;
    
    constructor() {
        var Constructor = this.constructor;
        
        while (Constructor !== Component) {
            injectDependencies(this, Constructor);
            injectAttributes(this, Constructor);
            createBindings(this, Constructor);
            
            Constructor = Object.getPrototypeOf(Constructor);
        }
    }
    
    ready() {};
    
    enter() {};
    
    leave() {};
    
    remove() {};
}

function injectAttributes(component: Component, Constructor) {
    var constructor
    
    if (!(Constructor.attributes instanceof Object)) {
        return;
    }
    
    var element = getDependency(Element),
        scope = getDependency(Scope),
        compiledAttributes = {},
        attributes = Constructor.attributes;
    
    Object.keys(attributes).forEach(
        attribute => {
            var value = attributes[attribute],
                first = value[0],
                binding,
                expression;
            
            if (first === '.' || first === '!') {
                binding = first === '.';
                value = value.substr(1);
                
                expression = new Expression(element.getAttribute(value || attribute), scope);
                
                if (binding) {
                    expression.watch(newValue => assign(component, attribute, newValue));
                }
                
                component[attribute] = expression.compile();
            } else {
                component[attribute] = element.getAttribute(value || attribute);
            }
        }
    );
}

function createBindings(component: Component, Constructor) {
    var bindings = Constructor.bindings;
    
    if (!(bindings instanceof Object)) {
        return;
    }
    
    var keys = Object.keys(bindings),
        i = keys.length,
        key;
    
    while (i--) {
        key = keys[i];
        watch(component, key, component[bindings[key]].bind(component));
    }
}
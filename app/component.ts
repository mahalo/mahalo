import ComponentGenerator from '../template/component-generator';
import ComponentController from './component-controller';

import Scope from './scope';
import Expression from '../expression/expression';
import {watch} from '../change-detection/watch';
import assign from '../change-detection/assign';
import {injectDependencies, getDependency} from './injector';

// @todo: Remove watchers
export default class Component {
    static locals: Array<string>;
    
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
                oneWay = first === '.',
                twoWay = first === ':',
                expression;
            
            if (oneWay || twoWay || first === '?') {
                value = value.substr(1);
                
                expression = new Expression(element.getAttribute(value || attribute), scope);
                
                if (oneWay || twoWay) {
                    expression.watch(newValue => assign(component, attribute, newValue));
                }
                
                // @todo: Implement two way binding
                if (twoWay) {
                    
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
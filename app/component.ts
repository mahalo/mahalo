import {Scope, ComponentGenerator, ComponentController, Expression, assign, watch} from '../index';
import {injectDependencies, getDependency} from './injector';
import keyPath from '../utils/key-path';

var expressions = new WeakMap();

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
            createAttributeBindings(this, Constructor);
            createBindings(this, Constructor);
            
            Constructor = Object.getPrototypeOf(Constructor);
        }
    }
    
    ready() {};
    
    enter() {};
    
    leave() {};
    
    remove() {};
}

function createAttributeBindings(component: Component, Constructor) {
    var constructor
    
    if (!(Constructor.attributes instanceof Object)) {
        return;
    }
    
    var element = getDependency(Element),
        scope = getDependency(Scope),
        compiledAttributes = {},
        attributes = Constructor.attributes,
        names =  Object.keys(attributes),
        i = names.length,
        name;
    
    expressions.set(component, []);
    
    while (i--) {
        name = names[i];
        createAttributeBinding(component, scope, name, attributes[name], element)
    }
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

function createAttributeBinding(component: Component, scope: Component|Scope, name: string, attribute: string, element: Element) {
    var first = attribute[0],
        oneWay = first === '.',
        twoWay = first === ':',
        path,
        expression;
        
    if (oneWay || twoWay || first === '?') {
        attribute = attribute.substr(1);
        path = element.getAttribute(attribute || name);
        expression = new Expression(path, scope);
        
        if (oneWay || twoWay) {
            expressions.get(component).push(expression);
            
            expression.watch(newValue => assign(component, name, newValue));
        }
        
        if (twoWay) {
            watch(component, name, newValue => keyPath(scope, path, newValue))
        }
        
        component[name] = expression.compile();
    } else {
        component[name] = element.getAttribute(attribute || name);
    }
}

export function removeAttributeBindings(component: Component) {
    if (expressions.has(component)) {
        expressions.get(component).forEach(expression => {
            expression.unwatch();
        });
        expressions.delete(component);
    }
}
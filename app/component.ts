import {ComponentGenerator, ComponentController, assign, watch} from '../mahalo';
import Scope from './scope';
import Expression from '../expression/expression';
import {injectDependencies, getDependency} from './injector';
import keyPath from '../utils/key-path';

// @todo: Remove watchers on destruction
export default class Component {
    static locals: Array<string>;
    
    static inject: Object;
    
    static attributes: Object;
    
    static bindings: Object; // @todo: rename to pull
    
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
        attributes = Constructor.attributes,
        names =  Object.keys(attributes),
        i = names.length,
        name;
    
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
/**
 * This module holds the heart of Mahalo. Most of your application
 * will rely on the Component class exported here
 */

/***/

import {Scope, ComponentGenerator, ComponentController, Expression, assign, keyPath, watch} from '../index';
import {injectDependencies, getDependency} from './injector';

/**
 * All Mahalo application are component based. From your application
 * container down to every single user control or span on the screen
 * 
 * 
 * 
 * Example:
 * ```javascript
 * import {Component} from 'mahalo';
 * 
 * export default class MyComponent extends Component {
 *     myProperty: string = 'Mahalo'
 * }
 * ```
 * 
 * @alias {Component} from mahalo
 */
export default class Component implements IComponent {
    /**
     * All keys of the component in this array of strings
     * will be available in children of the defining element
     * 
     * Example:
     * ```javascript
     * export default class MyComponent extends Component {
     *     static locals = ['firstName', 'lastName'];
     * }
     * ```
     */
    static locals: Array<string>;
    
    /**
     * Dependencies that will be injected into your component instance
     * 
     * Example:
     * ```javascript
     * export default class MyComponent extends Component {
     *     static inject = {element: Element};
     * }
     * ```
     */
    static inject: Object;
    
    /**
     * A map of attached attributes that will be pulled in from the defining element
     * 
     * Example:
     * ```javascript
     * export default class MyComponent extends Component {
     *     static attributes = {
     *         useAsIs: '',
     *         compileOnce: '!',
     *         bindOneWay: '.',
     *         bindTwoWayAndDefineName: ':attribute-name'
     *     };
     * }
     * ```
     */
    static attributes: Object;
    
    /**
     * A map where the keys are paths that should be watched on the component and
     * the values are names of methods that will be invoked on the component instance
     * 
     * Example:
     * ```javascript
     * export default class MyComponent extends Component {
     *     static bindings = {'element.clientHeight': heightChange};
     *     
     *     width: number;
     *     
     *     heightChange(height: number) {
     *         this.width = height * 2;
     *     }
     * }
     * ```
     */
    static bindings: Object;
    
    /**
     * When a string is given it must contain the html of the component's template
     * 
     * In general you should not make use of this at all. Your template should be
     * in a separate file with the same name and in the same folder as your component's
     * TypeScript file. This feature is only for advanced usage (for example having an empty
     * template by setting this to an empty string) or rapid prototyping. 
     */
    static template: string|ITemplate;
    
    /**
     * To initialize a component first its dependecies have to be injected,
     * then its attached attributes have to be processed and finally the
     * defined bindings have to be set up
     * 
     * This has to be done fo all definitions along the prototype chain to make
     * sure parent feature don't break.
     */
    constructor() {
        var Constructor = this.constructor;
        
        while (Constructor !== Component) {
            injectDependencies(this, Constructor);
            createAttributeBindings(this, Constructor);
            createBindings(this, Constructor);
            
            Constructor = Object.getPrototypeOf(Constructor);
        }
    }
}

/**
 * A hook for [[mahalo.ComponentController]] to unwatch expressions
 * from attached attributes
 */
export function removeAttributeBindings(component: Component) {
    if (expressions.has(component)) {
        expressions.get(component).forEach(expression => {
            expression.unwatch();
        });
        expressions.delete(component);
    }
}


//////////


var expressions = new WeakMap();

function createAttributeBindings(component: Component, Constructor) {
    if (!(Constructor.attributes instanceof Object)) {
        return;
    }
    
    var scope = getDependency(Scope),
        attributes = Constructor.attributes,
        names =  Object.keys(attributes),
        i = names.length,
        name;
    
    expressions.set(component, []);
    
    while (i--) {
        name = names[i];
        createAttributeBinding(component, scope, name, attributes[name])
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

function createAttributeBinding(component: Component, scope: Component|Scope, name: string, attribute: string) {
    var element = getDependency(Element),
        first = attribute[0],
        oneWay = first === '.',
        twoWay = first === ':';
    
    if (!oneWay && !twoWay && first !== '?') {
        component[name] = element.getAttribute(attribute || name);
        return;
    }
    
    var path = element.getAttribute(attribute.substr(1) || name),
        expression = new Expression(path, scope);
    
    if (oneWay || twoWay) {
        expressions.get(component).push(expression);
        
        expression.watch(newValue => assign(component, name, newValue));
    }
    
    if (twoWay) {
        watch(component, name, newValue => keyPath(scope, path, newValue))
    }
    
    component[name] = expression.compile();
}
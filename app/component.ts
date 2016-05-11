/**
 * This module holds the heart of Mahalo. Most of your application
 * will rely on the Component class exported here.
 */

/***/

import {Scope, ComponentGenerator, ComponentController, Expression, assign, keyPath, watch, filters} from '../index';
import {injectDependencies, getDependency} from './injector';

/**
 * All Mahalo applications are component based. For your application
 * container and every single DOM element inside of it Mahalo will create
 * a component instance for you. This instance belongs to a [[mahalo.ComponentController]]
 * that is part of a tree that represents your application.
 * 
 * A component can consist of two different parts: A template and a class.
 * It must have at least one of them but can also have both. To link them
 * together they must reside in the same folder and have the same name with
 * different extensions: .html for the template and .ts for your code behind.
 * 
 * Every time you want a component to do more than just render a template
 * you have to create a new class that extends this one. This class must
 * be the default export of the components .ts file.
 * 
 * For the most common use cases there are a few static properties that
 * you can define to make life easier. You can read more about them
 * further down the page.
 * 
 * ### Example
 * 
 * This is just a very simple example that defines a property that can then
 * be used in the template. Let's assume the following code is written
 * in a file called my-component.ts in the root folder.
 * 
 * ```javascript
 * import {Component} from 'mahalo';
 * 
 * export default class MyComponent extends Component {
 *     myProperty: string = 'Mahalo'
 * }
 * ```
 * 
 * The component's template is also in the root folder and is named my-component.html.
 * 
 * ```maml
 * <h2>${myProperty}</h2>
 * ```
 * 
 * Now you can use this component to output a headline reading **Mahalo** in another
 * template. For example app.html which is located besides the component files and
 * has the content shown below.
 * 
 * ```maml
 * <use component="./my-component"/>
 * 
 * <my-component><my-component>
 * ```
 * 
 * In the above code you can see **<my-component></my-component>** which is the
 * **defining element** of our component. This term always refers to the HTML element
 * inside a template that creates a new instance of a component. To tell Mahalo that
 * you want to use the component inside of the template you have to declare it with a
 * use tag as shown above. You can also rename the tag you want to use inside that
 * template by adding an **as** attribute to the use element.
 * 
 * @alias {Component} from mahalo
 */
export default class Component implements IComponent {
    /**
     * This static property defines which properties of the component
     * should be available in its local scope which will be used by the
     * component's behaviors as well as by the defining element's children.
     * 
     * Values of this array represent the name of one of the component's
     * properties that will be pushed to the local scope.
     * 
     * ##### Example
     * 
     * ```javascript
     * export default class MyComponent extends Component {
     *     static locals = ['firstName', 'lastName'];
     * }
     * ```
     */
    static locals: Array<string>;
    
    /**
     * This static property defines dependencies that will be injected into
     * your component's instance. This should be a map of property names as keys
     * and your desired dependency as its value.
     * 
     * When the dependency is of type Function then it is assumed to be
     * a class and an instance of it will be returned. This will always be
     * a singleton so you deal with the same instance in any place.
     * 
     * Of course there's an exception to the rule. It is possible to
     * specifically define what instance of a class will be returned.
     * Mahalo automatically does that for a few classes:
     * 
     * * **Element**: Will return the defining element of the component.
     * * [[mahalo.Component]]: Will return the parent component.
     * * [[mahalo.ComponentController]]: Will return the controller of the component.
     * * [[mahalo.ComponentGenerator]]: Will return the generator of the component's controller.
     * * [[mahalo.Scope]]: Will return the local scope in which the component was defined.
     * * **Custom Component**: Will traverse up the tree of controllers and find the next instance of the given component.
     * 
     * Read more about ensuring what dependencies will be returned on the [[mahalo/app/injector]] page.
     * You might need this for mocking in your tests.
     * 
     * ##### Example
     * 
     * ```javascript
     * export default class MyComponent extends Component {
     *     static inject = {element: Element};
     * }
     * ```
     */
    static inject: Object;
    
    /**
     * A map containing keys of properties that will pull in their value from
     * a given attribute of the defining element. The values are strings that
     * describe the binding that will be created as well as the attribute name.
     * In case you want the attribute's value to be treated as an expression you
     * can use one of the following symbols as a first character:
     * 
     * * **'?'**: Will compile the expression once an set the property's value to the result.
     * * **'.'**: Will update the property's value to the result of the expression whenever it changes.
     * * **':'**: Will keep the property's value in sync with the value at the path given in the attribute's value.
     * 
     * If one of these characters is found they will be trimmed from the string.
     * If the string is not empty after that it will be used as the name of attribute.
     * Otherwise the attribute's name is assumed to be equal to a hyphenated version
     * of the property name.
     * 
     * ##### Example
     * 
     * ```javascript
     * export default class MyComponent extends Component {
     *     static attributes = {
     *         // <my-component use-as-is=""></my-component>
     *         useAsIs: '',
     * 
     *         // <my-component compile-once="myVar + 1"></my-component>
     *         compileOnce: '?',
     * 
     *         // <my-component bind-one-way="myVar + 10"></my-component>
     *         bindOneWay: '.',
     * 
     *         // <my-component my-attribute="myVar"></my-component>
     *         bindTwoWayAndDefineName: ':my-attribute'
     *     };
     * }
     * ```
     */
    static attributes: Object;
    
    /**
     * This static property lets you define listeners that will be executed when
     * properties of the component change.
     * 
     * It should be a map where the keys are paths that should be watched on the component and
     * the values are names of methods that will be invoked on the component instance.
     * 
     * ##### Example
     * 
     * In the following example you can see a component that reacts to changes
     * in the size of the defining element.
     * 
     * ```javascript
     * export default class MyComponent extends Component {
     *     static inject: {element: Element};
     * 
     *     static bindings = {
     *         'element.clientHeight': 'heightChange'
     *     };
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
     * When a string is given it must contain the html of the component's template.
     * 
     * In general you should not make use of this at all. Your template should be
     * in a separate file with the same name and in the same folder as your component's
     * TypeScript file. This feature is only for advanced usage (for example having an empty
     * template by setting this to an empty string) or rapid prototyping. 
     */
    static template: string|ITemplate;
    
    /**
     * To initialize a component its dependecies have to be injected first,
     * then its attached attributes have to be processed and finally the
     * defined bindings have to be set up.
     * 
     * This has to be done for all definitions along the prototype chain to make
     * sure inherited features don't break.
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
 * from attached attributes.
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

/**
 * Loops over the attached attributes and create a binding for each one.
 */
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

/**
 * Creates a property on a component and sets its value according to the description.
 * It also creates the dsired bindings.
 */
function createAttributeBinding(component: Component, scope: Component|Scope, name: string, attribute: string) {
    var element = getDependency(Element),
        first = attribute[0],
        oneWay = first === '.',
        twoWay = first === ':';
    
    if (!oneWay && !twoWay && first !== '?') {
        component[name] = element.getAttribute(attribute || filters.hyphen(name));
        return;
    }
    
    var path = element.getAttribute(attribute.substr(1) || filters.hyphen(name)),
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

/**
 * Creates bindings to paths inside the component that execute a given
 * instance method when the value at a path changes.
 */
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
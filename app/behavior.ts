/**
 * This module holds functionality related to [[mahalo.Behavior]]
 * which should be imported from [[mahalo]]. Everything else here
 * is used internally and shouldn't be of much interest for you.
 */

/***/

import {Expression, Scope, watch} from '../index';
import {injectDependencies, getDependency} from './injector';
import asap from '../utils/asap';

/**
 * Behaviors are one of the core concepts in Mahalo. A behavior is
 * some kind of functionality that can be added to every component
 * by setting an attribute to the defining DOM element. The name of
 * the attribute is derived from the file name but can also be
 * specified in the template that uses the behavior.
 * 
 * All custom behaviors that you create in your Mahalo application
 * must extend this class. It handles dependency injection for and
 * also gives you an easy to use interface for setting up typical
 * features of behaviors.
 * 
 * ### Example
 * 
 * In the following example you can see a behavior that updates
 * a property on the component that it belongs to. Of course such a
 * behavior would only affect components that make use of that property.
 * 
 * ```javascript
 * import {Behavior, Component} from 'mahalo';
 * 
 * export default class MyBehavior extends Behavior {
 *     static inject = {component: Component};
 * 
 *     static update = 'update';
 * 
 *     update(newValue) {
 *         this.component.myBehavior = newValue;
 *     }
 * }
 * ```
 * 
 * To use this behavior you can use something like the following in
 * a template. This assumes that the behavior was defined in a file
 * named my-behavior.ts and the template that uses it is in the same
 * folder.
 * 
 * ```maml
 * <use component="./my-component"/>
 * <use behavior="./my-behavior" as="awesome-behavior"/>
 * 
 * <my-component awesome-behavior=""></my-component>
 * ```
 * 
 * @alias {Behavior} from mahalo
 */
export default class Behavior implements IBehavior {
    /**
     * This static property defines dependencies that will be injected into
     * your behavior instance. It should be a map of property names as keys and
     * your desired dependency as its value.
     * 
     * When the dependency is of type Function then it is assumed to be
     * a class and an instance of it will be returned. This will always be
     * a singleton so you deal with the same instance in any place.
     * 
     * Of course there's an exception to the rule. It is possible to
     * specifically define what instance of a class will be returned.
     * Mahalo automatically does that for a few classes:
     * 
     * * **Element**: Will return the element on which the behavior was defined.
     * * [[mahalo.Component]]: Will return the component of the element the behavior was defined on.
     * * [[mahalo.ComponentController]]: Will return the controller of the behavior.
     * * [[mahalo.ComponentGenerator]]: Will return the generator of the behavior's controller.
     * * [[mahalo.Scope]]: Will return the local scope in which the behavior was defined.
     * * **Custom Component**: Will traverse up the tree of controllers and find the next instance of the given component.
     * 
     * Read more about ensuring what dependencies will be returned on the [[mahalo/app/injector]] page.
     * You might need this for mocking in your tests.
     * 
     * ##### Example
     * 
     * ```javascript
     * export default class MyBehavior extends Behavior {
     *     static inject = {
     *         element: Element,
     *         component: Component
     *     };
     * }
     * ```
     */
    static inject: Object;
    
    /**
     * This static property defines the name of an instance method that
     * will be executed when the bahavior's value changes. That
     * simply means that the result of the expression that was created
     * from the value of the attribute used to define the behavior in
     * a template has changed.
     * 
     * This will always create a one way binding.
     * 
     * ##### Example
     * 
     * The following bahavior will execute its update method every
     * time the result of the expression given as an attribute value
     * changes.
     * 
     * ```javascript
     * export default class MyBehavior extends Behavior {
     *     static update = 'update';
     * 
     *     update() {}
     * }
     * ```
     */
    static update: string;
    
    /**
     * This static property lets you define listeners that will be executed when
     * properties of the behavior change.
     * 
     * It should be a map where the keys are paths that should be watched on the behavior instance
     * and the values are names of methods that will be invoked on it when the value
     * at a path changes.
     * 
     * ##### Example
     * 
     * The following example shows a behavior that reacts to a change in the height of
     * the defining element.
     * 
     * ```javascript
     * export default class MyBehavior extends Behavior {
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
     * To initialize a behavior its dependecies have to be injected first,
     * then the binding to its value has to be processed and finally the
     * defined bindings have to be set up.
     * 
     * This has to be done for all definitions along the prototype chain to make
     * sure inherited features don't break.
     * 
     * @param value The actual string literal of the attribute used for the current behavior instance.
     */
    constructor(value: string) {
        var Constructor = this.constructor;
        
        createBinding(this, value, Constructor);
        
        while (Constructor !== Behavior) {
            injectDependencies(this, Constructor);
            createBindings(this, Constructor);
            
            Constructor = Object.getPrototypeOf(Constructor);
        }
    }
}

/**
 * Removes the binding to a given behavior's value.
 */
export function removeBinding(behavior: Behavior) {
    if (expressions.has(behavior)) {
        expressions.get(behavior).unwatch();
        expressions.delete(behavior);
    }
}


//////////


var expressions = new WeakMap();

/**
 * Creates a binding to the bahavior's value that
 * executes the specified instance method.
 */
function createBinding(behavior: Behavior, value: string, Constructor) {
    var update = Constructor.update;
    
    if (!update || typeof update !== 'string' || typeof behavior[update] !== 'function') {
        return;
    }
    
    var expression = new Expression(value, getDependency(Scope));
    
    expression.watch(newValue => behavior[update](newValue));
    
    expressions.set(behavior, expression);
    
    asap(() => behavior[update](expression.compile()));
}

/**
 * Creates defined bindings to paths of the instance that
 * execute the given instance methods.
 */
function createBindings(behavior: Behavior, Constructor) {
    var bindings = Constructor.bindings;
    
    if (!(bindings instanceof Object)) {
        return;
    }
    
    var keys = Object.keys(bindings),
        i = keys.length,
        key;
    
    while (i--) {
        key = keys[i];
        watch(behavior, key, behavior[bindings[key]].bind(behavior));
    }
}
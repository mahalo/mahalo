/**
 * This module is responsible for Mahalo's dependency injection.
 */

/***/

import {Component, ComponentController, Behavior} from '../index';

const dependencies = new WeakMap();

/**
 * Injects dependencies into a component or behavior.
 * 
 * @param Constructor The class that has the static inject property.
 */
export function injectDependencies(component: Component|Behavior, Constructor: typeof Component|typeof Behavior) {
    let dependencies = Constructor.inject;
    
    if (!(dependencies instanceof Object)) {
        return;
    }
    
    let	keys = Object.keys(dependencies);
    let i = keys.length;
    
    while (i--) {
        let key = keys[i];
        
        inject(component, key, dependencies[key]);
    }
}

/**
 * Returns the dependency for a given class.
 */
export function getDependency(Constructor: Function) {
    return dependencies.get(Constructor);
}

/**
 * Sets the dependency for given class.
 */
export function setDependency(Constructor: Function, dependency: Object) {
    dependencies.set(Constructor, dependency);
}


//////////


/**
 * Ensures the correct dependency is set on the component or behavior.
 */
function inject(obj: Component|Behavior, key: string, Constructor: {(): void}) {
    let dependency = dependencies.get(Constructor);
    
    if (!dependency) {
        dependency = create(Constructor);
    }
    
    obj[key] = dependency;
}

/**
 * Finds a parent component in case the argument inherits from [[mahalo.Component]]
 * or creates a new singleton instance.
 */
function create(Constructor: {(): void}) {
    let prototype = Constructor.prototype;
    
    if (prototype instanceof Component) {
        let dependency = getDependency(ComponentController).parent;
        
        while (dependency && !(dependency.component instanceof Constructor)) {
            dependency = dependency.parent;
        }
        
        return dependency && dependency.component;
    }

    dependencies.set(Constructor, new Constructor());

    return dependencies.get(Constructor);
}
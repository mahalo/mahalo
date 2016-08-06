/**
 * This module is responsible for Mahalo's dependency injection.
 */

/***/

import {Component, ComponentController, Behavior} from '../index';

/**
 * Injects dependencies into a component or behavior.
 * 
 * @param Constructor The class that has the static inject property.
 */
export function injectDependencies(component: Component|Behavior, Constructor) {
    var dependencies = Constructor.inject;
    
    if (!(dependencies instanceof Object)) {
        return;
    }
    
    var	keys = Object.keys(dependencies),
        i = keys.length,
        key;
    
    while (i--) {
        key = keys[i];
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
export function setDependency(Constructor: Function, dependency) {
    dependencies.set(Constructor, dependency);
}


//////////


var dependencies = new WeakMap();

/**
 * Ensures the correct dependency is set on the component or behavior.
 */
function inject(obj: Component|Behavior, key: string, Constructor) {
    var dependency = dependencies.get(Constructor),
        prototype;
    
    if (!dependency) {
        dependency = create(Constructor);
    }
    
    obj[key] = dependency;
}

/**
 * Finds a parent component in case the argument inherits from [[mahalo.Component]]
 * or creates a new singleton instance.
 */
function create(Constructor) {
    var prototype = Constructor.prototype,
        dependency;
        
    if (prototype instanceof Component) {
        dependency = getDependency(ComponentController).parent;
        
        while (dependency && !(dependency.component instanceof Constructor)) {
            dependency = dependency.parent;
        }
        
        dependency = dependency && dependency.component;
    } else {
        dependencies.set(Constructor, dependency = new Constructor());
    }

    return dependency;
}
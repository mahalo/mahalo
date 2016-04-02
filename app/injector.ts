import {Component, ComponentController, Behavior} from '../index';

var dependencies = new WeakMap();

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

export function getDependency(Constructor: Function) {
    return dependencies.get(Constructor);
}

export function setDependency(Constructor, dependency) {
    dependencies.set(Constructor, dependency);
}

function inject(obj, key, Constructor) {
    var dependency = dependencies.get(Constructor),
        prototype;
    
    if (!dependency) {
        prototype = Constructor.prototype;
        
        if (prototype instanceof Component || prototype instanceof Behavior) {
            dependency = getDependency(ComponentController).parent;
            
            while (dependency && !(dependency.component instanceof Constructor)) {
                dependency = dependency.parent;
            }
            
            dependency = dependency && dependency.component;
        } else {
            dependencies.set(Constructor, dependency = new Constructor());
        }
    }
    
    obj[key] = dependency;
}
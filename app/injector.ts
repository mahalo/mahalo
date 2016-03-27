import ComponentController from './component-controller';
import Component from './component';
import Behavior from './behavior';

var dependencies = new WeakMap();

export function injectDependencies(component: Component|Behavior, Constructor) {
	if (!(Constructor.inject instanceof Object)) {
		return;
	}
	
	var dependencies = Constructor.inject,
		key;
	
	for (key in dependencies) {
		if (dependencies.hasOwnProperty(key)) {
			inject(component, key, dependencies[key]);
		}
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
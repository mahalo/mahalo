import ComponentController from './component-controller';
import Scope from './scope';

var dependencies = new WeakMap();

export default class Component {
	static locals: Object;
	
	static inject: Object;
	
	static render(container: Container, node: Element, scope: Component, attributes: Object) {
		var component = new this();
		
		if (this.locals) {
			scope = new Scope(scope, component, this.locals);
		}
		
		container.create(node, scope, component);
	}
	
	constructor() {
		if (!this.constructor.inject) {
			return;
		}
		
		var dependencies = this.constructor.inject,
			key;
		
		for (key in dependencies) {
			if (dependencies.hasOwnProperty(key)) {
				inject(this, key, dependencies[key]);
			}
		}
	}
	
	enter() {}
	
	leave() {}
	
	remove() {}
}

export function setDependency(Constructor, dependency) {
	dependencies.set(Constructor, dependency);
}

function inject(obj, key, Constructor) {
	var dependency = dependencies.get(Constructor);
	
	dependency || dependencies.set(Constructor, dependency = new Constructor());
	
	obj[key] = dependency;
}
import ComponentController from './component-controller';
import Container from './container';
import Scope from './scope';

var dependencies = new WeakMap();

export default class Component {
	static locals: Object;
	
	static inject: Object;
	
	static render(node: Element, scope: Component, attributes: Object) {
		var component = new this();
		
		if (this.hasOwnProperty('locals')) {
			scope = new Scope(scope, component, this.locals);
		}
		
		return new Container([new ComponentController(node, scope, component)]);
	}
	
	constructor() {
		if (!this.constructor.hasOwnProperty('inject')) {
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
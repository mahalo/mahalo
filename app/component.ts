import ComponentController from './component-controller';
import Scope from './scope';
import Expression from '../expression/expression';
import {watch} from '../change-detection/watch';
import {assign} from '../change-detection/property';

var dependencies = new WeakMap();

export default class Component {
	static locals: Object;
	
	static inject: Object;
	
	static attributes: Object;
	
	static bindings: Object;
	
	constructor() {
		var Constructor = this.constructor;
		
		injectDependencies(this, Constructor);
		injectAttributes(this, Constructor);
		createBindings(this, Constructor);
	}
	
	enter() {}
	
	leave() {}
	
	remove() {}
}

export function setDependency(Constructor, dependency) {
	dependencies.set(Constructor, dependency);
}

function inject(obj, key, Constructor: typeof Component) {
	var dependency = dependencies.get(Constructor);
	
	dependency || dependencies.set(Constructor, dependency = new Constructor());
	
	obj[key] = dependency;
}

function injectDependencies(component: Component, Constructor) {
	if (!Constructor.inject) {
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

function injectAttributes(component: Component, Constructor) {
	var constructor
	
	if (!(Constructor.attributes instanceof Object)) {
		return;
	}
	
	var element = dependencies.get(Element),
		scope = dependencies.get(Scope),
		compiledAttributes = {},
		attributes = Constructor.attributes,
		attribute,
		value;
	
	Object.keys(attributes).forEach(
		attribute => {
			value = attributes[attribute];
			
			if (value[0] === '.') {
				value = value.substr(1);
				
				component[attribute] = new Expression(element.getAttribute(value || attribute), scope).watch(
					newValue => assign(component, attribute, newValue)
				);
			} else {
				component[attribute] = element.getAttribute(value || attribute);
			}
		}
	);
}

function createBindings(component: Component, Constructor) {
	var bindings = Constructor.bindings,
		key;
	
	if (!(bindings instanceof Object)) {
		return;
	}
	
	for (key in bindings) {
		watch(component, key, component[bindings[key]].bind(component));
	}
}
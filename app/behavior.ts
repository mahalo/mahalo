import {injectDependencies, getDependency} from './injector';
import Scope from './scope';
import Expression from '../expression/expression';
import asap from '../utils/asap';
import {watch} from '../change-detection/watch';

export default class Behavior {
	static bind: string;
	
	static inject: Object;
	
	constructor(value: string) {
		var Constructor = this.constructor;
		
		createBinding(this, value, Constructor);
		
		while (Constructor !== Behavior) {
			injectDependencies(this, Constructor);
			createBindings(this, Constructor);
			
			Constructor = Object.getPrototypeOf(Constructor);
		}
	}
	
	remove() {}
}

function createBinding(behavior: Behavior, value: string, Constructor) {
	var bind = Constructor.bind,
		expression;
	
	if (typeof bind !== 'string' || typeof behavior[bind] !== 'function') {
		return;
	}
	
	expression = new Expression(value, getDependency(Scope));
	expression.watch(
		newValue => behavior[bind](newValue)
	);
	
	asap(() => behavior[bind](expression.compile()));
}

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
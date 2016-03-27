import {injectDependencies, getDependency} from './injector';
import Scope from './scope';
import Expression from '../expression/expression';
import asap from '../utils/asap';

export default class Behavior {
	static bind: string;
	
	static inject: Object;
	
	constructor(value: string) {
		var Constructor = this.constructor;
		
		createBinding(this, value, Constructor);
		
		while (Constructor !== Behavior) {
			injectDependencies(this, Constructor);
			
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
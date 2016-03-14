import Parser from './parser';
import {watch, unwatch} from '../change-detection/watch';
import clone from '../utils/clone';
import equals from '../utils/equals';

export default class Expression {
	parser: Parser;
	
	scope: Object;
	
	callbacks: Set<Function>;
	
	interceptor: Function;
	
	value;
	
	constructor(exp: string|Parser, scope: Object) {
		var parser = typeof exp === 'string' ? new Parser(exp) : exp;
		
		this.parser = parser;
		this.scope = scope;
		this.callbacks = new Set();
		this.interceptor = interceptor.bind(this);
		this.value = this.compile();
	}
	
	watch(callback: Function) {
		var value = this.compile();
		
		this.callbacks.size || this.parser.paths.forEach(function (path) {
			watch(this.scope, path, this.interceptor);
		}, this);
		
		this.callbacks.add(callback);
		
		this.value = clone(value);
		
		return value;
	}
	
	unwatch(callback?: Function) {
		if (callback) {
			this.callbacks.delete(callback);
		} else {
			this.callbacks.clear();
		}
		
		this.callbacks.size || this.parser.paths.forEach(function (path) {
			unwatch(this.scope, path, this.interceptor);
		}, this);
	}
	
	compile() {
		return this.parser.compile(this.scope);
	}
}

function interceptor() {
	var oldValue = this.value,
		newValue = this.compile();
	
	if (equals(newValue, oldValue)) {
		return;
	}
	
	this.value = clone(newValue);
	
	this.callbacks.forEach(function(callback) {
		callback(newValue, oldValue);
	});
}
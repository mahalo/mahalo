import {watch, unwatch} from '../watcher/watch';
import update from '../observer/update';

export default class Scope {
	constructor(component, localComponent, properties) {
		var property = properties[0],
			i = 0,
			value;
		
		while (property) {
			createProperty(this, property, localComponent);
			
			property = properties[++i];
		}
		
		for (property in component) {
			if (typeof component[property] !== 'function') {
				createProperty(this, property, component);
			}
		}
	}
}

function createProperty(scope, property, component) {
	if (scope.hasOwnProperty(property)) {
		return;
	}
	
	scope[property] = component[property];
	
	watch(component, property, function(value) {
		update(scope[property], scope, property, scope[property] = value);
	});
	
	var desc = Object.getOwnPropertyDescriptor(component, property);
	
	if (desc && desc.get && !desc.set) {
		return;
	}
	
	watch(scope, property, function(value) {
		update(component[property], component, property, component[property] = value);
	});
}
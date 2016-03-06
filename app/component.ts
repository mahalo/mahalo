import ComponentController from './component-controller';
import Container from './container';
import Scope from './scope';

export default class Component {
	static locals: Object;
	
	static render(node: Element, scope: Component, attributes: Object) {
		var component = new this();
		
		if (this.hasOwnProperty('locals')) {
			scope = new Scope(scope, component, this.locals);
		}
		
		return new Container([new ComponentController(node, scope, component)]);
	}
	
	enter() {}
	
	leave() {}
	
	remove() {}
}
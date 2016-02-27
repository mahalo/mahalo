import Element from './element';

export default class Component {	
	static components(node, scope, attributes) {
		return [new Element(node, new Component(), scope)];
	}
}
import ComponentElement from './componentElement';
import ElementList from './elementList';

export default class Component {	
	static components(node, scope, attributes) {
		return new ElementList(
			[
				new ComponentElement(node, new Component(), scope)
			]
		);
	}
}
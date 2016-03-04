import Element from './element';

export default class ComponentElement extends Element {
	compileChildren(children) {
		var element = this.node.querySelector('children');
		
		if (!element) {
			return;
		}
		
		var parent = element.parentNode,
			fragment = document.createDocumentFragment(),
			child = children[0],
			i = 0;
		
		while (child) {
			child.compile(fragment, this.scope, this);
			
			child = children[++i];
		}
		
		parent.replaceChild(fragment, element);
	}
}
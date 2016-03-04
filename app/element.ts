// import Component from './component';
import Scope from './scope';
import {unwatch} from '../change-detection/watch';

export default class XSElement {
	node: Element
	
	component: Component
	
	scope: Scope
	
	children: Array<Element>
		
	compiled: boolean
	
	position: number
	
	isEntering: boolean
	
	isLeaving: boolean
	
	constructor(node, component, scope) {
		this.node = node;
		this.component = component;
		this.scope = scope;
		this.children = [];
	}
	
	remove() {
		var component = this.component;
		
		unwatch(component);
		
		typeof component.$remove === 'function' && component.$remove();
		
		this.children.forEach(function(element) {
			element.remove();
		});
	}
}
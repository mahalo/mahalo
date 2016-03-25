import Behavior from './behavior';
import {addClass, removeClass} from '../utils/element-classes';

export default class Classes extends Behavior {
	static inject = {element: Element};
	
	static bind = 'update';
	
	element: Element;
	
	update(classes) {
		if (!(classes instanceof Object)) {
			return;
		}
		debugger;
		var element = this.element,
			name;
		
		for (name in classes) {
			if (classes.hasOwnProperty(name)) {
				if (classes[name]) {
					addClass(element, name);
				} else {
					removeClass(element, name);
				}
			}
		}
	}
}
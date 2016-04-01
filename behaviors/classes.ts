import Behavior from '../app/behavior';
import {addClass, removeClass} from '../utils/element-classes';

export default class Classes extends Behavior {
	static inject = {element: Element};
	
	static bind = 'update';
	
	element: Element;
	
	update(classes) {
		if (!(classes instanceof Object)) {
			return;
		}
		
		var element = this.element,
			names = Object.keys(names),
			i = names.length,
			name;
		
		while (i--) {
			name = names[i];
			
			if (classes[name]) {
				addClass(element, name);
			} else {
				removeClass(element, name);
			}
		}
	}
}
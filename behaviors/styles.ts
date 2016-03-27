import Behavior from '../app/behavior';

export default class Styles extends Behavior {
	static inject = {element: Element};
	
	static bind = 'update';
	
	element: Element;
	
	update(styles: Object) {
		if (!(styles instanceof Object)) {
			return;
		}
		
		var element = this.element,
			style = 'style' in element && element.style,
			name;
		
		if (!style) {
			return;
		}
		
		for (name in styles) {
			if (styles.hasOwnProperty(name)) {
				style[name] = styles[name];
			}
		}
	}
}
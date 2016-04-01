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
			style = 'style' in element && element.style;
		
		if (!style) {
			return;
		}
		
		var names = Object.keys(styles),
			i = names.length,
			name;
		
		while (i--) {
			name = names[i];
			style[name] = styles[name];
		}
	}
}
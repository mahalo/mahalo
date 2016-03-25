import Behavior from './behavior';

export default class Styles extends Behavior {
	static inject = {element: Element};
	
	static bind = 'update';
	
	element: Element;
	
	update(styles: Object) {
		if (!(styles instanceof Object)) {
			return;
		}
		
		var style = this.element.style,
			name;
		
		for (name in styles) {
			if (styles.hasOwnProperty(name)) {
				style[name] = styles[name];
			}
		}
	}
}
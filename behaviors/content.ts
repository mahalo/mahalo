import Behavior from './behavior';

export default class Content extends Behavior {
	static inject = {element: Element};
	
	static bind = 'update';
	
	element: Element;
	
	update(html) {
		this.element.innerHTML = html;
	}
}
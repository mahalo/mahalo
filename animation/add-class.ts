export default function addClass(controller: ComponentController, className) {
	var node = controller.node,
		element = node instanceof Element && node,
		classNames = element.className.split(/\s+/);
	
	if (classNames.indexOf(className) > -1) {
		return;
	}
	
	classNames.push(className);
	
	element.className = classNames.join(' ');
}
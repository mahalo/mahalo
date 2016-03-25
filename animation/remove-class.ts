export default function removeClass(controller: ComponentController, className) {
	var node = controller.node,
		element = node instanceof Element && node,
		classNames = element.className.split(/\s+/),
		i = classNames.indexOf(className);
	
	if (i < 0) {
		return;
	}
	
	classNames.splice(i, 1);
	
	element.className = classNames.join(' ');
}
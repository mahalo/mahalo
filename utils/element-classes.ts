export function addClass(element: Element, className) {
	var classNames = element.className ? element.className.split(/\s+/) : [];
	
	if (classNames.indexOf(className) > -1) {
		return;
	}
	
	classNames.push(className);
	
	element.className = classNames.join(' ');
}

export function removeClass(element: Element, className) {
	var classNames = element.className ? element.className.split(/\s+/) : [],
		i = classNames.indexOf(className);
	
	if (i < 0) {
		return;
	}
	
	if (classNames.length === 1) {
		return element.removeAttribute('class');
	}
	
	classNames.splice(i, 1);
	console.log(classNames);
	element.className = classNames.join(' ');
}
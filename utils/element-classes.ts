var SPLIT_CLASS_NAMES = /\s+/g;

export function addClass(element: Element, className) {
    var classNames = element.className ? element.className.split(SPLIT_CLASS_NAMES) : [];
    
    if (classNames.indexOf(className) > -1) {
        return;
    }
    
    classNames.push(className);
    
    element.className = classNames.join(' ');
}

export function removeClass(element: Element, className) {
    var classNames = element.className ? element.className.split(SPLIT_CLASS_NAMES) : [],
        i = classNames.indexOf(className);
    
    if (i < 0) {
        return;
    }
    
    if (classNames.length === 1) {
        return element.removeAttribute('class');
    }
    
    classNames.splice(i, 1);
    
    element.className = classNames.join(' ');
}
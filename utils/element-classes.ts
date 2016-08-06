/**
 * This module exports utility functions for adding and removing
 * classes of element's.
 */

/**
 * Adds a class name to an element's class list.
 */
export function addClass(element: Element, className) {
    var classNames = element.className ? element.className.split(SPLIT_CLASS_NAMES) : [];
    
    if (classNames.indexOf(className) > -1) {
        return;
    }
    
    classNames.push(className);
    
    element.className = classNames.join(' ');
}

/**
 * Removes a class name from an element's class list.
 */
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


//////////


var SPLIT_CLASS_NAMES = /\s+/g;
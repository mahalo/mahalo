/**
 * This module exports utility functions for adding and removing
 * classes of element's.
 */

/***/

const splitClassNames = /\s+/g;

/**
 * Adds a class name to an element's class list.
 */
export function addClass(element: Element, className) {
    let classNames = element.className ? element.className.split(splitClassNames) : [];
    
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
    let classNames = element.className ? element.className.split(splitClassNames) : [];
    let i = classNames.indexOf(className);
    
    if (i < 0) {
        return;
    }
    
    if (classNames.length === 1) {
        return element.removeAttribute('class');
    }
    
    classNames.splice(i, 1);
    
    element.className = classNames.join(' ');
}
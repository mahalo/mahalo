/**
 * This module is responsible for correct linking to routes.
 */

/***/

import {Component, ComponentController, Route, config} from '../index';
import {installed, setByPath} from './route';
import asap from '../utils/asap';

const isURL = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
const supportsPopState = 'onpopstate' in window && !/file/.test(window.location.protocol);

/**
 * The Anchor component automatically handles anchor tags to
 * make them properly work with routing and still keep their
 * usual behavior.
 * 
 * @alias {Anchor} from mahalo
 */
export default class Anchor extends Component {
    static inject = {
        element: Element,
        controller: ComponentController
    };
    
    static attributes = {
        href: ''
    };
    
    /**
     * The element of the component.
     */
    element: Element;
    
    /**
     * The controller of the component.
     */
    controller: ComponentController;
    
    /**
     * The original value of the href attribute.
     */
    href: string;
    
    /**
     * The resolved path that the element links to.
     */
    path: string;
    
    /**
     * The listener that is used for the interceptor.
     */
    click: EventListener;
    
    constructor() {
        super();
        
        asap(() => installed && this.init());
    }
    
    /**
     * Initializes the click event that intercepts the default behavior
     * but makes sure routing is active first.
     */
    init() {
        let href = this.href;
        
        if (!href || isURL.test(href)) {
            return;
        }
        
        this.click = click.bind(this);
        
        this.element.addEventListener('click', this.click);
        
        if (href[0] === '#') {
            return;
        }
        
        let parts = (href[0] === '/' ? href : relativePath(this.controller, href)).split('#');
        
        if (parts[0] !== '/') {
            parts[0] = parts[0].replace(/([^\/])$/, '$1/');
        }
        
        this.path = supportsPopState ? config.basePath.replace(/\/$/, '') + parts.join('#') : '#' + parts.join('#');
        
        this.element.setAttribute('href', this.path);
    }
    
    remove() {
        this.element.removeEventListener('click', this.click);
    }
}


//////////


/**
 * Computes the relative path of the link.
 */
function relativePath(controller: ComponentController, path: string) {
    let parent = controller.parent;
    
    while (parent) {
        let route = parent.component;
        
        if (route instanceof Route) {
            path = '/' + route.resolvedPath.join('/').replace(/\/$/g, '') + '/' + path;
            
            let parts = path.split('/');
            let part = parts[0];
            let i = 0;
            
            while (part) {
                if (i && part === '..') {
                    parts.splice(i - 1, 2);
                    i -= 2;
                }
                
                part = parts[++i];
            }
            
            return parts.join('/');
        }
        
        parent = parent.parent;
    }
    
    return path;
}

/**
 * An interceptor for click events.
 */
function click(event: Event) {
    let path = this.path || this.href;
    
    if (!supportsPopState && path[0] === '#') {
        path = window.location.hash.split('#').shift() + path;
    }
    
    setByPath(path);
    
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
}
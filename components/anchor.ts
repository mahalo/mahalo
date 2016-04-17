/**
 * 
 */

/***/

import {Component, ComponentController, Route, config} from '../index';
import {installed, setByPath} from './route';
import asap from '../utils/asap';

/**
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
    
    element: Element;
    
    controller: ComponentController;
    
    href: string;
    
    path: string;
    
    click: EventListener;
    
    constructor() {
        super();
        
        asap(() => installed && this.init());
    }
    
    init() {
        var href = this.href;
        
        if (!href || URL.test(href) || href[0] === '#' && supportsPopState) {
            return;
        }
        
        this.click = click.bind(this);
        
        this.element.addEventListener('click', this.click);
        
        if (href[0] === '#') {
            return;
        }
        
        var path = href[0] === '/' ? href : relativePath(this.controller, href);
        
        path = supportsPopState ? config.basePath.replace(/\/$/, '') + path : '#' + path;
        
        this.path = path === '/' ? path : path.replace(/\/$/, '');
        
        this.element.setAttribute('href', this.path);
    }
    
    remove() {
        this.element.removeEventListener('click', this.click);
    }
}


//////////


var URL = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
    supportsPopState = 'onpopstate' in window && !/file/.test(window.location.protocol);

function relativePath(controller: ComponentController, path: string) {
    var parent = controller.parent,
        route,
        parts,
        part,
        i = 0;
    
    while (parent) {
        route = parent.component;
        
        if (route instanceof Route) {
            path = '/' + route.resolvedPath.join('/').replace(/\/$/g, '') + '/' + path;
            
            parts = path.split('/');
            part = parts[0];
            i = 0;
            
            while (part) {
                if (i && part === '..') {
                    parts.splice(i - 1, 2);
                    i -= 2;
                }
                
                part = parts[++i];
            }
            
            return parts.join('/');
            // return path;
        }
        
        parent = parent.parent;
    }
    
    return path;
}

function click(event: Event) {
    if (this.path) {
        setByPath(this.path);
    } else {
        window.location.hash = window.location.hash.split('#')[0] + this.href;
    }
    
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
}
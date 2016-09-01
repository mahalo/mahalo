/**
 * This module is responsible for routing.
 */

/***/

import {Component, ComponentController, ComponentGenerator, Template, assign, config} from '../index';
import asap from '../utils/asap';
import enter from '../animation/enter';

const basePath = new RegExp('^' + config.basePath);
const fromFileSystem = /file/.test(window.location.protocol);
const supportsPopState = 'onpopstate' in window && !fromFileSystem;
const routes = new Set();

let currentPath = [];
let currentID = '';
let noResolve;

/**
 * In Mahalo routes are similar to rules. While it is important
 * to have rules, a ruler is an unnecessary evil. Just like
 * a router would be in Mahalo. We only need individual routes.
 * 
 * ### Simple usage
 * 
 * A route is simply defined in a template like below. This route would
 * only render its contents into the DOM when the url relative to the base
 * path is **about**.
 * 
 * ```html
 * <route path="/about">
 *     <h2>About</h2>
 * </route>
 * ``` 
 * 
 * Easy, isn't it. But it's not exactly true. Routes can be nested and
 * then become relative to their parent. Let's look at an example. The
 * following shows an about page with three child routes.
 * 
 * ```html
 * <route path="/about">
 *     <h2>About</h2>
 * 
 *     <route path="/">
 *         Please choose:
 * 
 *         <a href="/history">History</a>
 *         <a href="/team">Team</a>
 *     </route>
 * 
 *     <route path="/history">
 *         <h3>Team</h3>
 *     </route>
 * 
 *     <route path="/team">
 *         <h3>Team</h3>
 *     </route>
 * </route>
 * ```
 * 
 * The first child route will render when the url relative to the base path
 * is **about**. Just like its parent. However when the url is **about/team**
 * only the third child route will be rendered.
 * 
 * @alias {Route} from mahalo
 */
export default class Route extends Component {
    static inject = {
        element: Element,
        generator: ComponentGenerator,
        controller: ComponentController
    };
    
    static attributes = {id: '', path: ''};
    
    static template = '';
    
    /**
     * When inheriting from Route you can use this static attribute to provide
     * either a template or a path to a template file. When providing a path
     * Mahalo automatically creates a split point during packaging for lazy
     * loading of routes.
     */
    static view: string|Template|Function;
    
    /**
     * The components element.
     */
    element: Element;
    
    /**
     * The generator used to create the component.
     */
    generator: ComponentGenerator;
    
    /**
     * The component's controller.
     */
    controller: ComponentController;
    
    /**
     * The path of the route relative to its parent or the
     * base path.
     */
    path: string;
    
    /**
     * The id by which to address the route relative to its parent.
     */
    id: string;
    
    /**
     * A list of resolved parts of the route's path. 
     */
    resolvedPath: string[];
    
    /**
     * The resolved id.
     */
    resolvedID: string;
    
    /**
     * The child controller to render when the route's path is met.
     */
    child: ComponentController;
    
    /**
     * The params provided by the url.
     */
    $params = {};
    
    constructor() {
        super();
        
        let path = this.path && this.path.replace(/^([^\/])/, '/$1');
        let id = this.id;
        
        if (!path && !id) {
            return;
        }
        
        let parent = this.controller.parent;
        let visited = new Set();
        
        install();
        
        routes.add(this);

        while (parent) {
            let component = parent.component;
            let route = component instanceof Route && component;
            
            if (route && !visited.has(route)) {
                visited.add(route);
                
                if (path && route.path) {
                    path = route.path + path;
                }
                
                if (id && route.id) {
                    id = route.id + '-' + id;
                }
            }
            
            parent = parent.parent;
        }
        
        path && (this.resolvedPath = path.replace(/^\//, '').split('/'));
        
        id && (this.resolvedID = id);
        
        this.match(currentPath);
        
        matchID(this);
    }
    
    /**
     * Checks if the route should render.
     */
    match(path: string[]) {
        let resolvedPath = this.resolvedPath;
        
        if (!resolvedPath) {
            return this.deactivate();
        }
        
        let routeParams = {};
        let part = resolvedPath[0];
        let i = 0;
        
        while (typeof part === 'string') {
            
            if (part[0] === '#' && parseInt(path[i])) {
                
                routeParams[part.substr(1)] = parseInt(path[i]);
                
            } else if (part[0] === ':' && path[i]) {
                
                routeParams[part.substr(1)] = path[i];
                
            } else if ((part !== '' || path[i]) && part !== path[i]) {
                return this.deactivate();
            }
            
            part = resolvedPath[++i];
        }
        
        this.activate(routeParams);
    }
    
    /**
     * Triggers rendering of the route.
     */
    activate(routeParams: Object = {}) {
        let parts = Object.keys(routeParams);
        let i = parts.length;
        
        while (i--) {
            let part = parts[i];
            
            assign(this.$params, part, routeParams[part]);
        }
        
        if (typeof this.canActivate === 'function' && !this.canActivate()) {
            return this.deactivate();
        }
        
        if (typeof this.resolve === 'function') {
            Promise.resolve(this.resolve()).then(() => {
                this.createController();
            });
            
            return;
        }
        
        this.createController();
    }
    
    /**
     * Can be overwritten to check conditions before activation.
     */
    canActivate() {
        return true;
    }
    
    /**
     * Implementation of Component.remove.
     */
    remove() {
        routes.delete(this);
    }
    
    /**
     * Can return a promise that must be resolved before activating the route.
     */
    resolve() {}
    
    /**
     * Removes the route from the DOM.
     */
    deactivate() {
        if (this.child) {
            this.child.component = new Component();
            this.child.detach();
        }
        
        this.child = null;
    }
    
    
    //////////

    
    private createController() {
        if (this.child) {
            return;
        }
        
        let controller = this.controller;
        
        this.child = new ComponentController(
            Component,
            document.createDocumentFragment(),
            controller.scope,
            controller,
            ['$params']
        );
        
        this.ensureTemplate();
        
        return this.child;
    }
    
    private ensureTemplate() {
        let Constructor = this.constructor;
        
        if (!('view' in Constructor)) {
            return this.initController(void 0);
        }
        
        let view = Constructor['view'];
        
        if (typeof view !== 'function') {
            return this.initTemplate(view);
        }
        
        Promise.resolve(view()).then((template) => {
            setTimeout(() => this.initTemplate(template.default));
        });
    }
    
    private initTemplate(template: Template) {
        let Constructor = this.constructor;
        
        template = Constructor['view'] = template instanceof Template ? template : void 0;
        
        this.initController(template);
    }
    
    private initController(template?: Template) {
        let controller = this.controller;
        let childController = this.child;
        
        enter(controller, controller.parent.node, true);
        
        childController.component = this;
        
        childController.init(this.element, this.generator.children, {}, template);
        
        this.child = childController;
        
        goto();
    }
}

/**
 * Navigate to a route by its ID.
 */
export function setByID(id) {
    let match = false;
    
    currentID = id;
    
    document.querySelector('body').scrollTop = 0;
    
    routes.forEach((route) => {
        matchID(route, !match) && (match = true);
    });
    
    return match;
}

/**
 * Navigate to a route by its path. 
 */
export function setByPath(path: string) {
    if (supportsPopState) {
        noResolve = true;
        window.history.pushState({}, '', path);
    } else {
        window.location.hash = path;
    }
    
    resolve();
}

export let installed;


//////////


function install() {
    if (installed) {
        return;
    }
    
    let hash = window.location.hash.substr(1);
    
    installed = true;
    
    if (supportsPopState) {
        hash[0] === '/' && window.history.replaceState({}, '', hash);
        
        window.onpopstate = popstate;
    } else {
        hash = hash[0] === '/' ? hash : window.location.pathname + (hash ? '#' + hash : '');
        
        if (!fromFileSystem && window.location.pathname !== config.basePath) {
            window.location.href = config.basePath + (hash ? '#' + hash : '');
        }
        
        window.onhashchange = hashchange;
    }
    
    resolve();
}

function popstate(event: Event) {
    resolve();
    
    event.preventDefault();
}

function hashchange(event: Event) {
    event.preventDefault();
    
    if (noResolve) {
        noResolve = false;
        return;
    }
    
    resolve();
}

function resolve() {
    let parts = currentPath = normalize().split('/');
    
    routes.forEach(route => route.match(parts));
}

function normalize() {
    let path = window.location.pathname.replace(basePath, '');
    let hash = window.location.hash.substr(1);
    
    if (!supportsPopState && (fromFileSystem || hash[0] === '/')) {
        path = hash.split('#').shift();
    }
    
    goto() || window.scrollTo(0, 0);
    
    return path.replace(/\/$/, '').replace(/^\//, '');
}

// @todo: Improve scrolling by taking scroll containers into account
function goto() {
    let name = window.location.hash.substr(1);
    
    if (!supportsPopState) {
        name = name.substr(name.split('#').shift().length + 1);
    }
    
    if (!name) {
        return;
    }
    
    let anchor = document.querySelector('[name="' + name + '"]');
    let rect = anchor && anchor.getBoundingClientRect();
    
    if (!rect) {
        return;
    }
    
    let doc = document.documentElement;
    let left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
    let top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
    
    window.scrollTo(rect.left + left, rect.top + top);
    
    return true;
}

function matchID(route: Route, push?: boolean) {
    let resolvedID = route.resolvedID;
    
    if (!resolvedID || resolvedID !== currentID.substr(0, resolvedID.length)) {
        route.deactivate();
        return;
    }
    
    if (route.child) {
        return true;
    }
    
    route.activate({});
    
    if (!route.resolvedPath) {
        return true;
    }
    
    let path = '/' + route.resolvedPath.join('/').replace(/([^\/])$/, '$1/');
    
    if (supportsPopState) {
        window.history[push ? 'pushState' : 'replaceState']({}, '', path);
    } else {
        noResolve = true;
        window.location.hash = path;
    }
    
    return true;
}
/**
 * 
 */

/***/

import {Component, ComponentController, ComponentGenerator, Template, assign, config} from '../index';
import asap from '../utils/asap';
import enter from '../animation/enter';

/**
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
    
    static view: string|Template|Function;
    
    element: Element;
    
    generator: ComponentGenerator;
    
    controller: ComponentController;
    
    path: string;
    
    id: string;
    
    resolvedPath: Array<string>;
    
    resolvedID: string;
    
    child: ComponentController;
    
    $params = {};
    
    constructor() {
        super();
        
        var Constructor = this.constructor;
        
        // Make sure contructor is a direct sub class of Route		
        if (Constructor !== Route && Object.getPrototypeOf(Constructor) !== Route) {
            throw Error('It is not possible to extend classes that are derived from Route');
        }
        
        var path = this.path && this.path.replace(/^([^\/])/, '/$1'),
            id = this.id,
            visited = new Set(),
            parent;
        
        if (!path && !id) {
            return;
        }
        
        install();
        
        routes.add(this);
        
        parent = this.controller.parent;
        
        while (parent) {
            var component = parent.component,
                route = component instanceof Route && component;
            
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
    
    match(path: Array<string>) {
        var resolvedPath = this.resolvedPath,
            routeParams,
            part,
            i;
        
        if (!resolvedPath) {
            return this._detachController();
        }
        
        routeParams = {};
        part = resolvedPath[0];
        i = 0;
        
        while (typeof part === 'string') {
            
            if (part[0] === '#' && parseInt(path[i])) {
                
                routeParams[part.substr(1)] = parseInt(path[i]);
                
            } else if (part[0] === ':' && path[i]) {
                
                routeParams[part.substr(1)] = path[i];
                
            } else if ((part !== '' || path[i]) && part !== path[i]) {
                return this._detachController();
            }
            
            part = resolvedPath[++i];
        }
        
        this.activate(routeParams);
    }
    
    activate(routeParams: Object = {}) {
        var parts = Object.keys(routeParams),
            i = parts.length,
            part;
        
        while (i--) {
            part = parts[i];
            assign(this.$params, part, routeParams[part]);
        }
        
        if (typeof this.canActivate === 'function' && !this.canActivate()) {
            return this._detachController();
        }
        
        if (typeof this.resolve === 'function') {
            Promise.resolve(this.resolve()).then(() => {
                this._createController();
            });
            return;
        }
        
        this._createController();
    }
    
    canActivate() {
        return true;
    }
    
    remove() {
        routes.delete(this);
    }
    
    resolve() {}
    
    
    //////////
    
    
    _detachController() {
        if (this.child) {
            this.child.component = new Component();
            this.child.detach();
        }
        
        this.child = null;
    }
    
    _createController() {
        if (this.child) {
            return;
        }
        
        var controller = this.controller,
            element = document.createDocumentFragment(),
            childController = new ComponentController(Component, element, controller.scope, controller, ['$params']),
            component = childController.component;
        
        this.child = childController;
        
        this._ensureTemplate();
        
        return childController;
    }
    
    _ensureTemplate() {
        var Constructor = this.constructor;
        
        if (!('view' in Constructor)) {
            return this._initController(void 0);
        }
        
        var view = Constructor['view'];
        
        if (typeof view !== 'function') {
            return this._initTemplate(view);
        }
        
        Promise.resolve(view()).then((template) => {
            setTimeout(() => this._initTemplate(template.default));
        });
    }
    
    _initTemplate(template: Template) {
        var Constructor = this.constructor;
        
        template = template instanceof Template ? template : void 0;
        
        Constructor['view'] = template;
        
        this._initController(template);
    }
    
    _initController(template?: Template) {
        var controller = this.controller,
            childController = this.child;
        
        enter(controller, controller.parent.node, true);
        
        childController.component = this;
        
        childController.init(this.element, this.generator.children, {}, template);
        
        this.child = childController;
        
        goto();
    }
}

/**
 * 
 */
export function setByID(id) {
    var match = false;
    
    currentID = id;
    
    document.querySelector('body').scrollTop = 0;
    
    routes.forEach((route) => {
        matchID(route, !match) && (match = true);
    });
    
    return match;
}

/**
 * 
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

export var installed;


//////////


var BASE_PATH = new RegExp('^' + config.basePath),
    fromFileSystem = /file/.test(window.location.protocol),
    supportsPopState = 'onpopstate' in window && !fromFileSystem,
    routes = new Set(),
    currentPath = [],
    currentID = '',
    noResolve;

function install() {
    if (installed) {
        return;
    }
    
    var hash = window.location.hash.substr(1);
    
    installed = true;
    
    if (supportsPopState) {
        hash[0] === '/' && window.history.replaceState({}, '', hash);
        
        window.onpopstate = popstate;
    } else {
        hash = hash[0] === '/' ? hash : window.location.pathname + (hash ? '#' + hash : '');
        
        !fromFileSystem && window.location.pathname !== config.basePath && (window.location.href = config.basePath + (hash ? '#' + hash : ''));
        
        window.onhashchange = hashchange;
    }
    
    resolve();
    
    
    //////////
    
    
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
}

function resolve() {
    var parts = currentPath = normalize().split('/');
    
    routes.forEach(route => route.match(parts));
}

function normalize() {
    var path = window.location.pathname.replace(BASE_PATH, ''),
        hash = window.location.hash.substr(1);
    
    if (!supportsPopState && (fromFileSystem || hash[0] === '/')) {
        path = hash.split('#').shift();
    }
    
    goto() || window.scrollTo(0, 0);
    
    return path.replace(/\/$/, '').replace(/^\//, '');
}

// @todo: Improve scrolling by taking scroll containers into account
function goto() {
    var name = window.location.hash.substr(1);
    
    if (!supportsPopState) {
        name = name.substr(name.split('#').shift().length + 1);
    }
    
    if (!name) {
        return;
    }
    
    var anchor = document.querySelector('[name="' + name + '"]'),
        rect = anchor && anchor.getBoundingClientRect();
    
    if (!rect) {
        return;
    }
    
    var doc = document.documentElement,
        left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0),
        top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
    
    window.scrollTo(rect.left + left, rect.top + top);
    
    return true;
}

function matchID(route, push?: boolean) {
    var resolvedID = route.resolvedID;
    
    if (!resolvedID || resolvedID !== currentID.substr(0, resolvedID.length)) {
        route._detachController();
        return;
    }
    
    if (route.child) {
        return true;
    }
    
    route.activate({});
    
    if (!route.resolvedPath) {
        return true;
    }
    
    var path = '/' + route.resolvedPath.join('/').replace(/([^\/])$/, '$1/');
    
    if (supportsPopState) {
        window.history[push ? 'pushState' : 'replaceState']({}, '', path);
    } else {
        noResolve = true;
        window.location.hash = path;
    }
    
    return true;
}
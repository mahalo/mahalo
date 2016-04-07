import {Template, Component, ComponentController, ComponentGenerator, assign, config} from '../index';
import asap from '../utils/asap';
import enter from '../animation/enter';

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
        
        var path = (this.path || '').replace(/^([^\/])/, '/$1'),
            id = this.id,
            visited = new Set(),
            parent;
        
        install();
        
        routes.add(this);
        
        parent = this.controller.parent;
        
        while (parent) {
            var component = parent.component,
                route = component instanceof Route && component;
            
            if (route && !visited.has(route)) {
                visited.add(route);
                
                if (route.path) {
                    path = route.path + path;
                }
                
                if (id && route.id) {
                    id = route.id + '-' + id;
                }
            }
            
            parent = parent.parent;
        }
        
        this.resolvedPath = path.replace(/^\//, '').split('/');
        
        id && (this.resolvedID = id);
    }
    
    match(path: Array<string>) {
        var resolvedPath = this.resolvedPath,
            routeParams,
            part,
            i;
        
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
    
    activate(routeParams: Object = {}, id?: string) {
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
                this._createController(id);
            });
            return;
        }
        
        this._createController(id);
    }
    
    canActivate() {
        return true;
    }
    
    resolve() {}
    
    remove() {
        routes.delete(this);
    }
    
    _detachController() {
        if (this.child) {
            this.child.component = new Component();
            this.child.detach();
        }
        
        this.child = null;
    }
    
    _createController(id?: string) {
        if (this.child) {
            return;
        }
        
        var controller = this.controller,
            element = document.createDocumentFragment(),
            childController = new ComponentController(Component, element, controller.scope, controller, ['$params']),
            component = childController.component;
        
        this.child = childController;
        
        this._ensureTemplate(id);
        
        return childController;
    }
    
    _ensureTemplate(id?: string) {
        var Constructor = this.constructor;
        
        if (!('view' in Constructor)) {
            return this._initController(void 0, id);
        }
        
        var view = Constructor['view'];
        
        if (typeof view === 'function') {
            Promise.resolve(view()).then((template) => {
                this._initTemplate(template.default, id);
            });
        }
        
        this._initTemplate(view, id);
    }
    
    _initTemplate(template, id?: string) {
        var Constructor = this.constructor;
        
        template = template instanceof Template ? template : void 0;
        
        Constructor['view'] = template;
        
        this._initController(template, id);
    }
    
    _initController(template?: Template, id?: string) {
        var controller = this.controller,
            childController = this.child;
        
        enter(controller, controller.parent.node, true);
        
        document.querySelector('body').scrollTop = 0;
        
        childController.component = this;
        
        childController.init(this.element, this.generator.children, {}, template);
        
        this.child = childController;
        
        if (id && this.resolvedID) {
            setByID(id);
        } else if (this.resolvedPath) {
            resolve();
        }
    }
}

export function setByID(id) {
    var match = false;
    
    routes.forEach(route => {
        var resolvedID = route.resolvedID;
        
        if (!resolvedID || resolvedID !== id.substr(0, resolvedID.length)) {
            route._detachController();
            return;
        }
        
        if (route.child) {
            return;
        }
        
        match = true;
        
        asap(() => {
            var path = '/' + route.resolvedPath.join('/').replace(/\/$/, '');
            
            if (supportsPopState) {
                window.history.pushState({}, '', path);
            } else {
                noResolve = true;
                window.location.hash = path;
            }
        });
        
        route.activate({}, id);
    });
    
    return match;
}

export function setByPath(path: string) {
    if (!supportsPopState) {
        window.location.hash = path;
        return;
    }
    
    window.history.pushState({}, '', path);
    
    resolve();
}


//////////


var BASE_PATH = new RegExp(config.basePath),
    supportsPopState = 'onpopstate' in window && !/file/.test(window.location.protocol),
    routes = new Set(),
    installed,
    noResolve;

function install() {
    if (installed) {
        return;
    }
    
    installed = true;
    
    window.onhashchange = hashChange;
    
    setTimeout(resolve);
    
    
    //////////
    
    
    function popState(event: Event) {
        resolve();
        
        event.preventDefault();
    }
    
    function hashChange(event: Event) {
        if (noResolve) {
            noResolve = false;
            return;
        }
        
        var hash = window.location.hash;
        
        if (hash[1] && hash[1] !== '/') {
            supportsPopState || goto(hash.substr(1));
            return;
        }
        
        supportsPopState && window.history.replaceState({}, '', hash.substr(1));
        
        resolve();
        
        event.preventDefault();
    }
}

function resolve() {
    var parts = normalize().split('/');
    
    routes.forEach(route => route.match(parts));
}

function normalize() {
    var path;
    
    if (supportsPopState) {
        path = window.location.pathname;
        path = path.replace(BASE_PATH, '');
    } else {
        path = window.location.hash.substr(1);
    }
    
    return path.replace(/\/$/, '').replace(/^\//, '');
}

function goto(id: string) {
    // @todo: Implement fake jumping to anchors
}
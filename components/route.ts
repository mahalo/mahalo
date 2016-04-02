import {Template, Component, ComponentController, ComponentGenerator, assign} from '../mahalo';
import asap from '../utils/asap';
import enter from '../animation/enter';

var routes = new Set(),
    noResolve,
    currentID;

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
        
        var path = this.path,
            id = this.id,
            visited = new Set(),
            parent;
        
        routes.add(this);
        
        if (!path && !id) {
            return;
        }
        
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
    }
    
    match(path: Array<string>) {
        var routePath = this.resolvedPath,
            routeParams,
            part,
            i;
        
        if (!routePath) {
            return this._detachController();
        }
        
        routeParams = {};
        part = routePath[0];
        i = 0;
        
        while (typeof part === 'string') {
            
            if (part[0] === '#' && parseInt(path[i])) {
                
                routeParams[part.substr(1)] = parseInt(path[i]);
                
            } else if (part[0] === ':' && path[i]) {
                
                routeParams[part.substr(1)] = path[i];
                
            } else if (part !== path[i]) {
                
                return this._detachController();
                
            }
            
            part = routePath[++i];
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
            return this._initController();
        }
        
        var view = Constructor['view'];
        
        if (typeof view === 'function') {
            Promise.resolve(view()).then((template) => {
                this._initTemplate(template.default);
            });
        }
        
        this._initTemplate(view);
    }
    
    _initTemplate(template) {
        var Constructor = this.constructor;
        
        template = template instanceof Template ? template : void 0;
        
        Constructor['view'] = template;
        this._initController(template);
    }
    
    _initController(template?: Template) {
        var controller = this.controller,
            childController = this.child;
        
        enter(controller, controller.parent.node, true);
        
        document.querySelector('body').scrollTop = 0;
        
        childController.component = this;
        
        childController.init(this.element, this.generator.children, {}, template);
        
        this.child = childController;
        
        if (noResolve && this.resolvedID) {
            setRoute();
        } else if (this.resolvedPath) {
            resolve();
        }
    }
}

export function setRoute(id?) {
    var match = false;
    
    id = id || currentID;
    currentID = id;
    
    routes.forEach(route => {
        var resolvedID = route.resolvedID;
        
        if (resolvedID && resolvedID === id.substr(0, resolvedID.length)) {
            if (route.resolvedPath) {
                noResolve = true;
                asap(() => window.location.hash = '#/' + route.resolvedPath.join('/'));
            }
            
            route.activate();
            
            match = true;
        } else {
            route._detachController();
        }
    });
    
    return match;
}

window.addEventListener('hashchange', resolve);

asap(resolve);


//////////


function resolve() {
    if (noResolve) {
        noResolve = false;
        return;
    }
    
    var hash = window.location.hash,
        path;
    
    if (hash[1] !== '/') {
        path = [''];
    }
    
    path = hash.substr(2).split('/');
    
    routes.forEach(route => route.match(path));
}
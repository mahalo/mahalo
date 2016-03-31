import Component from '../app/component';
import ComponentGenerator from '../template/component-generator';
import ComponentController from '../app/component-controller';
import assign from '../change-detection/assign';
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
	
	element: Element;
	
	generator: ComponentGenerator;
	
	controller: ComponentController;
	
	path: string;
	
	id: string;
	
	resolvedPath: Array<string>;
	
	resolvedID: string;
	
	child: ComponentController;
	
	template: Template;
	
	$params = {};
	
	constructor() {
		super();
		
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
			return this.detachController();
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
				
				return this.detachController();
				
			}
			
			part = routePath[++i];
		}
		
		this.activate(routeParams);
	}
	
	activate(routeParams?: Object) {
		var part;
		
		routeParams = routeParams || {};
		
		for (part in routeParams) {
			if (routeParams.hasOwnProperty(part)) {
				assign(this.$params, part, routeParams[part]);
			}
		}
		
		if (typeof this.canActivate === 'function' && !this.canActivate()) {
			return this.detachController();
		}
		
		if (typeof this.resolve === 'function') {
			Promise.resolve(this.resolve()).then(() => {
				this.createController();
			});
			return;
		}
		
		this.createController();
	}
	
	detachController() {
		if (this.child) {
			this.child.component = new Component();
			this.child.detach();
		}
		
		this.child = null;
	}
	
	createController() {
		if (this.child) {
			return;
		}
		
		var controller = this.controller,
			element = document.createDocumentFragment(),
			childController = new ComponentController(Component, element, controller.scope, controller, {
				$params: '.'
			}),
			component = childController.component;
		
		enter(controller, controller.parent.node, true);
		
		childController.component = this;
		
		childController.init(this.element, this.generator.children, {}, this.template);
		
		this.child = childController;
		
		if (noResolve && this.resolvedID) {
			setRoute();
		} else if (this.resolvedPath) {
			resolve();
		}
		
		return childController;
	}
	
	remove() {
		routes.delete(this);
	}
	
	canActivate() {
		return true;
	};
	
	resolve() {};
}

// @todo: Make id nestable
export function setRoute(id?) {
	var match = false;
	
	id = id || currentID;
	currentID = id;
	
	routes.forEach(route => {
		var resolvedID = route.resolvedID;
		
		if (resolvedID && resolvedID === id.substr(0, resolvedID.length)) {
			if (route.resolvedPath) {
				noResolve = true;
				window.location.hash = '#/' + route.resolvedPath.join('/');
			}
			
			route.activate();
			
			match = true;
		} else {
			route.detachController();
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
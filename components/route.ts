import Component from '../app/component';
import ComponentGenerator from '../template/component-generator';
import ComponentController from '../app/component-controller';
import {assign} from '../change-detection/property';
import asap from '../utils/asap';

var routes = new Set();

export default class Route extends Component {
	static inject = {
		element: Element,
		generator: ComponentGenerator,
		controller: ComponentController
	};
	
	static attributes = {path: ''};
	
	static template = '';
	
	element: Element;
	
	generator: ComponentGenerator;
	
	controller: ComponentController;
	
	path: string;
	
	resolvedPath: Array<string>;
	
	child: ComponentController;
	
	template: Template;
	
	$params = {};
	
	constructor() {
		super();
		
		var path = this.path,
			parent;
		
		routes.add(this);
		
		if (!path) {
			return;
		}
		
		parent = this.controller.parent;
			
		while (parent) {
			var component = parent.component,
				route = component instanceof Route && component;
			
			if (route) {
				path = route.path + path;
			}
			
			parent = parent.parent;
		}
		
		this.resolvedPath = path.replace(/^\//, '').split('/');
		
	}
	
	match(path: Array<string>) {
		var routePath = this.resolvedPath,
			routeParams = {},
			part = routePath[0],
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
		this.child && this.child.detach();
		this.child = null;
	}
	
	createController() {
		if (this.child) {
			return;
		}
		
		var component = new Component(),
			element = document.createElement('visible'),
			controller = new ComponentController(Component, element, this.controller.scope, this.controller, {
				$params: '.'
			});
		
		controller.init(this.element, this.generator.children, {}, this.template);

		this.child = controller;
		
		resolve();
		
		return controller;
	}
	
	remove() {
		routes.delete(this);
	}
	
	canActivate() {
		return true;
	};
	
	resolve() {};
}

// @todo: Fix changing of route
export function setRoute(id) {
	routes.forEach(
		route => route.element.id === id ? route.activate() : route.detachController()
	);
}

window.addEventListener('hashchange', resolve);

asap(resolve);


//////////


function resolve() {
	var hash = window.location.hash,
		path;
    
    if (hash[1] !== '/') {
        path = [''];
    }
	
	path = hash.substr(2).split('/');
	
	routes.forEach(
		route => typeof route.path === 'string' ? route.match(path) : route.detachController()
	);
}
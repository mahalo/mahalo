import Component from '../app/component';
import ComponentGenerator from '../template/component-generator';
import ComponentController from '../app/component-controller';

export default class Show extends Component {
	static inject = {
		element: Element,
		generator: ComponentGenerator,
		controller: ComponentController
	};
	
	static attributes = {if: '.'};
	
	static bindings = {if: 'update'};
	
	static template = '';
	
	element: Element;
	
	generator: ComponentGenerator;
	
	controller: ComponentController;
	
	if: boolean;
	
	child: ComponentController;
	
	constructor() {
		super();
		
		this.update(this.if);
	}
	
	update(value) {
		if (value) {
			return this.createController();
		}
		
		this.child && this.child.detach();
		this.child = null;
	}
	
	createController() {
		var component = new Component(),
			element = document.createElement('visible'),
			controller = new ComponentController(Component, element, this.controller.scope, this.controller);
		
		controller.init(this.element, this.generator.children, {});

		return this.child = controller;
	}
}
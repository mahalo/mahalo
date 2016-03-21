import ComponentController from './app/component-controller';
import App from './app/app';

export default function bootstrap(template: Template, node: Element, scope: Component) {
	var controller = new ComponentController(App, node, scope);
	
	// controller.component = scope;
	// var key,
	// 	desc;
	
	// for (key in scope) {
	// 	desc = Object.getOwnPropertyDescriptor(scope, key);
	// 	desc && Object.defineProperty(this, key, desc);
	// }
	
	console.log(controller);
	
	template.compile(node, scope, controller);
}
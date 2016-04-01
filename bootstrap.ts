// Only needed to change order of importing, might be removable when bootstrapping is optimized
import Template from './template/template';

import ComponentController from './app/component-controller';
import App from './app/app';

export default function bootstrap(template: Template, node: Element, scope: Component) {
	var controller = new ComponentController(App, node, scope);
	
	console.log(controller);
	
	template.compile(node, scope, controller);
}
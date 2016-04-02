// Only needed to change order of importing, might be removable when bootstrapping is optimized
import './template/template';

import ComponentController from './app/component-controller';
import App from './app/app';

// @todo: Refactor to use component constructor instead of scope as third argument
export default function bootstrap(template: Template, node: Element, app: App) {
	var controller = new ComponentController(App, node, app);
	
	console.log(controller);
	
	template.compile(node, app, controller);
}
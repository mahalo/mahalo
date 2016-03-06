import ComponentController from './app/component-controller';

export default function bootstrap(template, node, scope) {
	var controller = new ComponentController(node, scope, scope);
	
	console.log(controller);
	
	template.compile(node, scope, controller);
}
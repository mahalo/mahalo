import Element from './app/element';

export default function bootstrap(app, node, scope) {
	var element = new Element(node, scope, scope);
	
	console.log(element);
	
	app.compile(node, scope, element);
}
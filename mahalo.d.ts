interface Controller {
	node: Node;
	
	parent: ComponentController;
	
	remove();
}

interface Template {
	components: Object;
	
	attributes: Object;
	
	children: Array<Generator>;
	
	// constructor(html?: string, components?: Object, attributes?: Object);
	
	// parseChildNodes(childNodes: NodeList): Array<Generator>;
	
	// checkNode(node: Node): Generator;
	
	// checkText(textNode: Node): TextGenerator;
	
	// checkComponent(element: Element): ComponentGenerator;
	
	// checkAttributes(element: Element, component: Object): ComponentGenerator;
	
	// checkAttribute(component, attribute, node): void;
	
	compile(node: Element|DocumentFragment, scope: Object, controller: ComponentController): void;
}

interface ComponentController extends Controller {
	node: Element|DocumentFragment;
	
	scope: Component;
	
	component: Component;
	
	children: Set<Controller>;
	
	compiled: boolean;
	
	position: number;
	
	isEntering: boolean;
	
	isLeaving: boolean;
	
	init(parentNode: Element|DocumentFragment, template: Template, children: Array<Generator>);
	
	compileChildren(children: Array<Generator>);
}

interface Generator {
	node: Node;
	
	compile(parentNode: DocumentFragment, scope: Component, controller: ComponentController): void;
}

// interface ComponentGenerator extends Generator {	
// 	template: Template;
	
// 	Component: ComponentConstructor;
	
// 	children: Array<Generator>;
// }

// interface TextGenerator {
// 	parts: Array<string|Parser>;
	
// 	parseText(text: string): void;
// }

interface Component {
	enter();
	
	leave();
	
	remove();
}

interface ComponentConstructor {
	locals: Object;
	
	inject: Object;
	
	attributes: Object;
	
	bindings: Object;
}

interface ExpressionBranch {
	type: number;
	
	name?: string;
	
	arg?: ExpressionBranch;
	
	filter?: string;
	
	prop?: ExpressionBranch;
	
	obj?: ExpressionBranch;
	
	op?: string;
	
	left?: ExpressionBranch;
	
	right?: ExpressionBranch;
	
	str?: string;
	
	content?: ExpressionBranch;
	
	num?: string;
	
	keys?: Object;
	
	items?: Array<any>;
	
	args?: Array<ExpressionBranch>;
}
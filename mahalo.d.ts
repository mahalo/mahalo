interface Controller {
	node: Node;
	
	scope: Component;
	
	parent: ComponentController;
	
	remove();
}

interface Template {
	// components: Object;
	
	// attributes: Object;
	
	// children: Array<Generator>;
	
	// constructor(html?: string, components?: Object, attributes?: Object);
	
	// parseChildNodes(childNodes: NodeList): Array<Generator>;
	
	// checkNode(node: Node): Generator;
	
	// checkText(textNode: Node): TextGenerator;
	
	// checkComponent(element: Element): ComponentGenerator;
	
	// checkAttributes(element: Element, component: Object): ComponentGenerator;
	
	// checkAttribute(component, attribute, node): void;
	
	compile(node: Element, scope: Object, controller: ComponentController): void;
}

interface ComponentController {
	// node: Element;
	
	// scope: Component;
	
	// parent: ComponentController;
	
	// component: Component;
	
	children: Set<Controller>;
	
	// compiled: boolean;
	
	// position: number;
	
	// isEntering: boolean;
	
	// isLeaving: boolean;
	
	// compileChildren(children: Array<Generator>);
	
	// remove();
}

interface Container {
// 	elements: Array<ComponentController>;
	
// 	template: Template;
	
// 	children: Array<ComponentController>;
	
// 	parentController: ComponentController;
	
// 	link: Node;
	
// 	leaving: Set<ComponentController>;
	
// 	entering: Set<ComponentController>;

	create(node: Element, scope: Component, component: Component);
}

interface Expression {
	
}

interface Generator {
	// node: Node;
	
	compile(parentNode: DocumentFragment, scope: Component, controller: ComponentController): void;
}

// interface TextGenerator {
// 	node: Node;
	
// 	parts: Array<string|Expression>;
	
// 	constructor(node: Node);
	
// 	parseText(text: string): void;
	
// 	compile(parentNode: DocumentFragment, scope: Component, parentController: Controller): void;
// }

// interface ComponentGenerator {
// 	node: Node;
	
// 	attributes: Object;
	
// 	template: Template;
	
// 	Component: Component;
	
// 	children: Array<any>;
	
// 	scope: Object;
	
// 	constructor(node: Element, desc: {Component?: Component, template?: Template});
	
// 	compile(parentNode: DocumentFragment, scope: Component, parentController: Controller): void;
	
// 	compileAttributes(Component: Function, node: Element, scope: Component): Object;
// }

interface Component {
	enter();
	
	leave();
	
	remove();
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
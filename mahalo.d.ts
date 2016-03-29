interface Controller {
	node: Node;
	
	parent: ComponentController;
	
	remove();
}

interface Template {
	components: Object;
	
	behaviors: Object;
	
	children: Array<Generator>;
	
	parseChildNodes(childNodes: NodeList): Array<Generator>;
	
	checkNode(node: Node): Generator;
	
	checkText(textNode: Node): TextGenerator;
	
	checkComponent(element: Element): ComponentGenerator;
	
	checkBehaviors(element: Element, component: Object): ComponentGenerator;
	
	checkBehavior(attribute: Attr, generator: ComponentGenerator): void;
	
	compile(node: Element|DocumentFragment, scope: Scope|Component, controller: ComponentController): void;
}

interface Scope {
	
}

interface Behavior {
	remove();
}

interface ComponentController extends Controller {
	node: Element|DocumentFragment;
	
	scope: Scope|Component;
	
	localScope: Scope|Component;
	
	parent: ComponentController;
	
	component: Component;
	
	behaviors: Set<Behavior>;
	
	children: Set<Controller>;
	
	compiled: boolean;
	
	position: number;
	
	isEntering: boolean;
	
	isLeaving: boolean;
	
	init(parentNode: Element|DocumentFragment, children: Array<Generator>, behaviors: Object, template?: Template);
	
	compileChildren(children);
	
	append(parentNode, animate);
	
	initBehaviors(behaviors: Object);
	
	detach(animate?: boolean);
	
	remove();
}

interface Generator {
	node: Node;
	
	compile(parentNode: Element|DocumentFragment, scope: Scope|Component, controller: ComponentController): void;
}

interface ComponentGenerator extends Generator {	
	template: Template;
	
	Constructor: ComponentConstructor;
	
	behaviors: Object;
	
	children: Array<Generator>;
	
	compile(parentNode: Element|DocumentFragment, scope: Scope|Component, parent: ComponentController);
}

interface TextGenerator extends Generator {
	parts: Array<string|Parser>;
	
	parseText(text: string): void;
}

interface Parser {
	expression: string;
	
	i: number;
	
	paths: Set<string>;
	
	ast: ExpressionBranch;
	
	symbol: ExpressionSymbol;
	
	comparison(): ExpressionBranch;
	
	sum(): ExpressionBranch;
	
	multiply(): ExpressionBranch;
	
	filter(): ExpressionBranch;
	
	unary(): ExpressionBranch;
	
	paren(): ExpressionBranch;
	
	operand(): ExpressionBranch;
	
	member(): ExpressionBranch;
	
	object(): Object;
	
	key(): {key: string, value: ExpressionBranch};
	
	array(): Array<ExpressionBranch>;
	
	memberOrIdentifier(ident): ExpressionBranch;
	
	call(member): ExpressionBranch;
	
	bracketIdentifier(): ExpressionBranch;
	
	identifier(): ExpressionBranch;
	
	expect(type: number): void;
	
	accept(type: number): boolean;
	
	nextSymbol(): ExpressionBranch;
	
	addPath(branch: ExpressionBranch, path?: string);
	
	resolvePath(branch, path): void;
	
	compile(scope: Object);
}

interface ComponentConstructor {
	locals: Object;
	
	inject: Object;
	
	attributes: Object;
	
	bindings: Object;
	
	template: string;
}

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

interface ExpressionSymbol {
	type: number
	
	str: string
	
	start: number
}
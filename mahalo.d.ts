interface Controller {
	node: Node;
	
	parent: ComponentController;
	
	remove();
}

interface Template {
	components: Object;
	
	behaviors: Object;
	
	children: Array<Generator>;
	
	compile(node: Element|DocumentFragment, scope: Scope|Component, controller: ComponentController): void;

	_parseChildNodes(childNodes: NodeList): Array<Generator>;
	
	_checkNode(node: Node): Generator;
	
	_checkText(textNode: Node): TextGenerator;
	
	_checkComponent(element: Element): ComponentGenerator;
	
	_checkBehaviors(element: Element, component: Object): ComponentGenerator;
	
	_checkBehavior(attribute: Attr, generator: ComponentGenerator): void;
}

interface Scope {
	
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
	
	append(parentNode, animate);
	
	detach(animate?: boolean);
	
	remove();
	
	_compileChildren(children);
	
	_initBehaviors(behaviors: Object);
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
}

interface TextGenerator extends Generator {
	parts: Array<string|Parser>;
	
	_parseText(text: string): void;
}

interface Parser {
	expression: string;
	
	i: number;
	
	paths: Set<string>;
	
	ast: ExpressionBranch;
	
	symbol: ExpressionSymbol;
	
	compile(scope: Object);
	
	_comparison(): ExpressionBranch;
	
	_sum(): ExpressionBranch;
	
	_multiply(): ExpressionBranch;
	
	_filter(): ExpressionBranch;
	
	_unary(): ExpressionBranch;
	
	_paren(): ExpressionBranch;
	
	_operand(): ExpressionBranch;
	
	_member(): ExpressionBranch;
	
	_object(): Object;
	
	_key(): {key: string, value: ExpressionBranch};
	
	_array(): Array<ExpressionBranch>;
	
	_memberOrIdentifier(ident): ExpressionBranch;
	
	_call(member): ExpressionBranch;
	
	_bracketIdentifier(): ExpressionBranch;
	
	_identifier(): ExpressionBranch;
	
	_expect(type: number): void;
	
	_accept(type: number): boolean;
	
	_nextSymbol(): ExpressionBranch;
	
	_isBracketIdentifier(): boolean;
	
	_addPath(branch: ExpressionBranch, path?: string);
	
	_resolvePath(branch, path): void;
}

interface ComponentConstructor {
	locals: Object;
	
	inject: Object;
	
	attributes: Object;
	
	bindings: Object;
	
	template: string|Template;
}

interface Component {
	enter();
	
	leave();
	
	remove();
}

interface BehaviorConstructor {
	
}

interface Behavior {
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

// declare var require: {
// 	ensure(dependencies: Array<string>, callback?: Function): Promise<Function>;
// }
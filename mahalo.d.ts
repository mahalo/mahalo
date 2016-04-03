interface Controller {
    node: Node;
    
    parent: ComponentController;
    
    remove();
    
    removeChildren();
}

interface Template {
    components: Object;
    
    behaviors: Object;
    
    children: Array<Generator>;
    
    compile(parentNode: Element|DocumentFragment, scope: Scope|Component, controller: ComponentController): void;

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
    
    removeChildren();
    
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
    parts: Array<Object>;
    
    _parseText(text: string): void;
}

interface ComponentConstructor {
    locals: Array<string>;
    
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
    inject: Object;
    
    bind: string;
    
    bindings: Object;
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

interface ArrayConstructor {
    copyWithin();
    
    entries();
    
    fill();
    
    find();
    
    findIndex();
    
    keys();
    
    values();
}

interface StringConstructor {
    codePointAt();
    
    endsWith();
    
    includes();
    
    repeat();
    
    startsWith();
}	
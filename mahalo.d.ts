/**
 * The typescript definition file of Mahalo. All interfaces are defined
 * here to get IntelliSense working properly. Is also used by typedoc.
 */

/**
 * @alias {IController} from mahalo
 */
interface IController {
    node: Node;
    
    parent: IComponentController;
    
    remove();
    
    removeChildren();
}

/**
 * @alias {ITemplate} from mahalo
 */
interface ITemplate {
    components: Object;
    
    behaviors: Object;
    
    children: Array<IGenerator>;
    
    compile(parentNode: Element|DocumentFragment, scope: IScope|IComponent, controller: IComponentController): void;

    _parseChildNodes(childNodes: NodeList): Array<IGenerator>;
    
    _checkNode(node: Node): IGenerator;
    
    _checkText(textNode: Node): ITextGenerator;
    
    _checkComponent(element: Element): IComponentGenerator;
    
    _checkBehaviors(element: Element, component: Object): IComponentGenerator;
    
    _checkBehavior(attribute: Attr, generator: IComponentGenerator): void;
}

/**
 * @alias {IScope} from mahalo
 */
interface IScope {
    
}

/**
 * @alias {IComponentController} from mahalo
 */
interface IComponentController extends IController {
    node: Element|DocumentFragment;
    
    scope: IScope|IComponent;
    
    localScope: IScope|IComponent;
    
    parent: IComponentController;
    
    component: IComponent;
    
    behaviors: Set<IBehavior>;
    
    children: Set<IController>;
    
    compiled: boolean;
    
    position: number;
    
    isEntering: boolean;
    
    isLeaving: boolean;
    
    init(parentNode: Element|DocumentFragment, children: Array<IGenerator>, behaviors: Object, template?: ITemplate);
    
    append(parentNode, animate);
    
    detach(animate?: boolean);
    
    remove();
    
    removeChildren();
    
    _compileChildren(children);
    
    _initBehaviors(behaviors: Object);
}

/**
 * @alias {IGenerator} from mahalo
 */
interface IGenerator {
    node: Node;
    
    compile(parentNode: Element|DocumentFragment, scope: IScope|IComponent, controller: IComponentController): void;
}

/**
 * @alias {IComponentGenerator} from mahalo
 */
interface IComponentGenerator extends IGenerator {	
    template: ITemplate;
    
    Constructor: IComponentConstructor;
    
    behaviors: Object;
    
    children: Array<IGenerator>;
}

/**
 * @alias {ITextGenerator} from mahalo
 */
interface ITextGenerator extends IGenerator {
    parts: Array<Object>;
    
    _parseText(text: string): void;
}

/**
 * @alias {IComponentConstructor} from mahalo
 */
interface IComponentConstructor {
    locals?: Array<string>;
    
    inject?: Object;
    
    attributes?: Object;
    
    bindings?: Object;
    
    template?: string|ITemplate;
    
    new(): IComponent;
}

/**
 * @alias {IComponent} from mahalo
 */
interface IComponent {
    ready?();
    
    enter?();
    
    leave?();
    
    remove?();
}

// interface IInjectDescriptor {
//     [property: string]: any;
// }

// interface IAttributesDescriptor {
//     [property: string]: string;
// }

// interface IBindingsDescriptor {
//     [path: string]: string;
// }

/**
 * Interface for Mahalo behaviors
 * 
 * @alias {IBehavior} from mahalo
 */
interface IBehavior {
    remove?();
}

/**
 * @alias {IExpressionBranch} from mahalo
 */
interface IExpressionBranch {
    type: number;
    
    name?: string;
    
    arg?: IExpressionBranch;
    
    filter?: string;
    
    prop?: IExpressionBranch;
    
    obj?: IExpressionBranch;
    
    op?: string;
    
    left?: IExpressionBranch;
    
    right?: IExpressionBranch;
    
    str?: string;
    
    content?: IExpressionBranch;
    
    num?: string;
    
    keys?: Object;
    
    items?: Array<any>;
    
    args?: Array<IExpressionBranch>;
}

/**
 * @alias {IExpressionSymbol} from mahalo
 */
interface IExpressionSymbol {
    type: number
    
    str: string
    
    start: number
}
/**
 * This module is responsible for templating.
 */

/***/

import {config} from '../index';

// Generators
import {ComponentGenerator} from '../index';
import TextGenerator from './text-generator';
import ChildrenGenerator from './children-generator';

// Components
import {Show, For, Route, Anchor, Form} from '../index';

// Behaviors
import EventBehavior from '../behaviors/event-behavior';
import AttributeBehavior from '../behaviors/attribute-behavior';
import {Classes, Styles, Content, Model, Link} from '../index';

/**
 * The template class parses an HTML string into a tree of node generators.
 * This tree represents the view of a [[mahalo.Component]]. Mahalo will
 * use it later to create the child nodes for that component.
 * 
 * In general there is no need to create template instances yourself. They are
 * automatically created for you when packaging your Mahalo application. It will
 * also be linked to its code behind in a **.ts** file with the same name and
 * location.
 * 
 * The content of your template file is standard HTML but you should not use
 * any **html**, **head** or **body** tags. Just define the HTML structure of your
 * component. For every HTML tag defined Mahalo will later create a component
 * instance. Which class and template are used to instantiate that component is
 * defined with a special tags at top of your template file as explained below.
 * 
 * ### Outputting computed text
 * 
 * For outputting the evaluated result of an expression you can use the special
 * output tag that start with **${** and ends with **}**. For example like
 * seen below.
 * 
 * ```html
 * ${ user.points + 100 }
 * ```
 * 
 * This text will automatically change when the data in your scope changes which
 * leads to a different result for the used expression.
 * 
 * ### Including components
 * 
 * To use components inside of each other you have to include them first. This
 * is done by the special **use** tag. Let's assume we have a **User** component
 * inside of a subfolder named **components**. Let's include it an **app.mhml**
 * which can be found in the web root folder and is our entry template. We add
 * the following.
 * 
 * ```html
 * <use component="./components/user"/>
 * ```
 * 
 * To use the component we can define it later in the HTML. The tag name will
 * be the same as the name of your template or component file without any
 * extension. Therefore valid file names must also be valid tag names. That
 * means they should start with a letter followed by any number of: letters,
 * numbers, underscores, hyphens or dots. In our example we would use the below.
 * 
 * ```html
 * <user></user>
 * ```
 * 
 * If you want to be more specific about which elements to use for a component
 * you can provide a selector that will be matched against every element in the
 * template. Let's use our **User** component for every element with a **data-user**
 * attribute.
 * 
 * ```html
 * <use component="./components/user" selector="[data-user]"/>
 * 
 * <div data-user></div>
 * ```
 * 
 * ### Including behaviors
 * 
 * Similar to components you can also add a [[mahalo.Behavior]] to components.
 * Or any number of them to be exact. Let's say we want our **User** component
 * to use a custom **draggable** behavior in a subfolder named **behaviors**.
 * We need to change the top of our **app.mhml** and add the following.
 * 
 * ```html
 * <use component="./components/user" selector="[data-user]"/>
 * <use behavior="./behaviors/draggable" attribute="data-draggable"/>
 * 
 * <div data-user data-draggable></div>
 * ```
 * 
 * As you can see we change the attribute to use for our behavior to **data-draggable**.
 * Otherwise the file name would be used again.
 * 
 * ### Built-in components and behaviors
 * 
 * Of course there is always an exeption to the rule. Mahalo ships with a few
 * built-in components and behaviors that are very commonly needed. These
 * don't have to be included with the special **use** tag. They are always
 * available in every template.
 * 
 * You can find an overview on the page of the [[mahalo]] module. If you want
 * to change the default selector/attribute they use you can do so in the
 * [[mahalo#config]].
 * 
 * @alias {Template} from mahalo
 */
export default class Template implements ITemplate {
    /**
     * A map of components used in this template where the key is
     * a selector and the value is a description of the component.
     */
    components: Object;
    
    /**
     * A map of behaviors used in this template where the key is
     * an attribute name and the value is the [[mahalo.Behavior]].
     */
    behaviors: Object;
    
    /**
     * A list of generator to create the templates view elements.
     */
    children: Array<IGenerator>;
    
    constructor(html?: string, components?: Object, behaviors?: Object) {
        this.components = components || {};
        
        this.behaviors = behaviors || {};
        
        this.children = this._parseChildNodes(parseHTML(html));
    }
    
    /**
     * Compiles the template inside of a given scope and parent and
     * appends it to a parent node.
     */
    compile(parentNode: Element|DocumentFragment, scope: IScope|IComponent, controller: IComponentController) {
        var children = this.children,
            child = children[0],
            i = 0;
        
        while (child) {
            child.compile(parentNode, scope, controller);
            
            child = children[++i];
        }
    }
    
    
    //////////
    
    
    /**
     * Creates a generator for every node in a NodeList and adds it
     * to an array that is returned.
     */
    _parseChildNodes(childNodes: NodeList) {
        var children: Array<IGenerator> = [],
            child = childNodes[0],
            i = 0,
            generator;
            
        while (child) {
            generator = this._checkNode(child);
            generator && children.push(generator);
            
            child = childNodes[++i];
        }
        
        return children;
    }
    
    /**
     * Checks a node for its type to create the proper generator.
     */
    _checkNode(node: Node): IGenerator {
        if (node.nodeType === TEXT_NODE) {
            return this._checkText(node);
        }
        
        var element = node instanceof Element && node;
        
        if (!element) {
            return;
        }
        
        if (element.tagName === 'CHILDREN') {
            return new ChildrenGenerator(element.cloneNode());
        }
        
        return this._checkComponent(element);
    }
    
    /**
     * Creates and returns a [[mahalo/template/text-generator.TextGenerator]] for a
     * text node.
     */
    _checkText(textNode: Node) {
        if (!textNode.textContent.trim()) {
            return;
        }
        
        return new TextGenerator(textNode.cloneNode());
    }
    
    /**
     * Returns a generator for a DOM element that instantiates the proper
     * [[mahalo.Component]] when compiling the template.
     */
    _checkComponent(element: Element) {
        if (element.tagName === 'PRE') {
            return new ComponentGenerator(element, {template: new Template('')});
        }

        var components = this.components,
            selector,
            component;
        
        for (selector in components) {
            if (element[MATCHES](selector)) {
                component = components[selector];
                break;
            }
        }

        if (!component) {
            if (element[MATCHES](config.FOR_SELECTOR)) {
                
                component = {Component: For};
                
            } else if (element[MATCHES](config.SHOW_SELECTOR)) {
                
                component = {Component: Show};
                
            } else if (element[MATCHES](config.ROUTE_SELECTOR)) {
                
                component = {Component: Route};
                
            } else if (element[MATCHES]('form')) {
                
                component = {Component: Form};
                
            } else if (element[MATCHES]('a')) {
                
                component = {Component: Anchor};
                
            }
        }

        return this._checkBehaviors(element, component);
    }
    
    /**
     * Creates and returns a generator for a [[mahalo.Component]] so
     * it can be instantiated when the template is compiled.
     */
    _checkBehaviors(element: Element, component: Object) {
        var childNodes = element.childNodes,
            generator = new ComponentGenerator(element, component),
            attributes = element.attributes,
            attribute = attributes[0],
            i = 0;
        
        while (attribute) {
            this._checkBehavior(attribute, generator);
            
            attribute = attributes[++i];
        }
        
        generator.children = childNodes.length ? this._parseChildNodes(childNodes) : [];
        
        return generator;
    }
    
    /**
     * Aattaches the desired behaviors to a generator so they can be instantiated
     * when the template is compiled.
     */
    _checkBehavior(attribute: Attr, generator: ComponentGenerator) {
        var behaviors = this.behaviors,
            name = attribute.name,
            Behavior;
        
        if (/^@/.test(name)) {

            Behavior = EventBehavior;

        } else if (/^#/.test(name)) {
            
            Behavior = AttributeBehavior;
        
        } else if (behaviors.hasOwnProperty(name)) {
            
            Behavior = behaviors[name];
        
        } else if (name === config.CLASSES_ATTRIBUTE) {
            
            Behavior = Classes;
        
        } else if (name === config.STYLES_ATTRIBUTE) {
            
            Behavior = Styles;
        
        } else if (name === config.CONTENT_ATTRIBUTE) {
            
            Behavior = Content;
        
        } else if (name === config.MODEL_ATTRIBUTE) {
            
            Behavior = Model;
        
        } else if (name === config.LINK_ATTRIBUTE) {
            
            Behavior = Link;
        
        }
        
        if (!Behavior) {
            return;
        }
        
        generator.behaviors[name] = {
            Behavior: Behavior,
            value: attribute.value
        }
    }
}


//////////


var TEXT_NODE = Node.TEXT_NODE,
    MATCHES = 'matches' in Element.prototype ? 'matches' : 'msMatchesSelector';

/**
 * Parses an HTML string into a NodeList.
 */
function parseHTML(html: string) {
    var container = document.createElement('div');
    
    html && (container.innerHTML = html);
    
    return container.childNodes;
}
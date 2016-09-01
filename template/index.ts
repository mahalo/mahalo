/**
 * This module is responsible for templating.
 */

/***/

import {config} from '../index';

// Generators
import {Scope, Component, ComponentController, ComponentGenerator} from '../index';
import {IGenerator} from './generator';
import TextGenerator from './text-generator';
import ChildrenGenerator from './children-generator';

// Components
import {Show, For, Route, Anchor, Form} from '../index';

// Behaviors
import EventBehavior from '../behaviors/event-behavior';
import AttributeBehavior from '../behaviors/attribute-behavior';
import {Classes, Styles, Content, Model, Link} from '../index';

const textNodeValue = Node.TEXT_NODE;
const matches = 'matches' in Element.prototype ? 'matches' : 'webkitMatchesSelector' in Element.prototype ? 'webkitMatchesSelector' : 'msMatchesSelector';

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
export default class Template {
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
    children: IGenerator[];
    
    constructor(html?: string, components?: Object, behaviors?: Object) {
        this.components = components || {};
        
        this.behaviors = behaviors || {};
        
        this.children = this.parseChildNodes(parseHTML(html));
    }
    
    /**
     * Compiles the template inside of a given scope and parent and
     * appends it to a parent node.
     */
    compile(parentNode: Element|DocumentFragment, scope: Scope|Component, controller: ComponentController) {
        let children = this.children;
        let child = children[0];
        let i = 0;
        
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
    private parseChildNodes(childNodes: NodeList) {
        let children: IGenerator[] = [];
        let child = childNodes[0];
        let i = 0;
            
        while (child) {
            let generator = this.checkNode(child);
            
            generator && children.push(generator);
            
            child = childNodes[++i];
        }
        
        return children;
    }
    
    /**
     * Checks a node for its type to create the proper generator.
     */
    private checkNode(node: Node): IGenerator {
        if (node.nodeType === textNodeValue) {
            return this.checkText(node);
        }
        
        if (!(node instanceof Element)) {
            return;
        }
        
        if ((<Element>node).tagName === 'CHILDREN') {
            return new ChildrenGenerator(node.cloneNode());
        }
        
        return this.checkComponent(<Element>node);
    }
    
    /**
     * Creates and returns a [[mahalo/template/text-generator.TextGenerator]] for a
     * text node.
     */
    private checkText(textNode: Node) {
        if (!textNode.textContent.trim()) {
            return;
        }
        
        return new TextGenerator(textNode.cloneNode());
    }
    
    /**
     * Returns a generator for a DOM element that instantiates the proper
     * [[mahalo.Component]] when compiling the template.
     */
    private checkComponent(element: Element) {
        if (/^(PRE|SCRIPT|TEXTAREA)$/.test(element.tagName)) {
            return new ComponentGenerator(element, {template: new Template('')});
        }

        let components = this.components;
        let component;
        
        for (let selector in components) {
            if (element[matches](selector)) {
                component = components[selector];
                break;
            }
        }

        if (!component) {
            if (element[matches](config.forSelector)) {
                
                component = {Component: For};
                
            } else if (element[matches](config.showSelector)) {
                
                component = {Component: Show};
                
            } else if (element[matches](config.routeSelector)) {
                
                component = {Component: Route};
                
            } else if (element[matches]('form')) {
                
                component = {Component: Form};
                
            } else if (element[matches]('a')) {
                
                component = {Component: Anchor};
                
            }
        }

        return this.checkBehaviors(element, component);
    }
    
    /**
     * Creates and returns a generator for a [[mahalo.Component]] so
     * it can be instantiated when the template is compiled.
     */
    private checkBehaviors(element: Element, component: Object) {
        let childNodes = element.childNodes;
        let generator = new ComponentGenerator(element, component);
        let attributes = element.attributes;
        let attribute = attributes[0];
        let i = 0;
        
        while (attribute) {
            this.checkBehavior(attribute, generator);
            
            attribute = attributes[++i];
        }
        
        generator.children = childNodes.length ? this.parseChildNodes(childNodes) : [];
        
        return generator;
    }
    
    /**
     * Aattaches the desired behaviors to a generator so they can be instantiated
     * when the template is compiled.
     */
    private checkBehavior(attribute: Attr, generator: ComponentGenerator) {
        let behaviors = this.behaviors;
        let name = attribute.name;
        let Behavior;
        
        if (/^@/.test(name)) {

            Behavior = EventBehavior;

        } else if (/^#/.test(name)) {
            
            Behavior = AttributeBehavior;
        
        } else if (behaviors.hasOwnProperty(name)) {
            
            Behavior = behaviors[name];
        
        } else if (name === config.classesAttribute) {
            
            Behavior = Classes;
        
        } else if (name === config.stylesAttribute) {
            
            Behavior = Styles;
        
        } else if (name === config.contentAttribute) {
            
            Behavior = Content;
        
        } else if (name === config.modelAttribute) {
            
            Behavior = Model;
        
        } else if (name === config.linkAttribute) {
            
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


/**
 * Parses an HTML string into a NodeList.
 */
function parseHTML(html: string) {
    let container = document.createElement('div');
    
    html && (container.innerHTML = html);
    
    return container.childNodes;
}
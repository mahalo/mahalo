import {Component, ComponentController} from './mahalo';

export default function bootstrap(component: Component, template: Template, node: Element) {
    var controller = new ComponentController(Component, node, component);
    
    console.log(controller);
    
    template.compile(node, component, controller);
}
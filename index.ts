/// <reference path="mahalo.d.ts" />

import Component from './app/component';
import ComponentController from './app/component-controller';

export {default as Scope} from './app/scope';
export {default as Component} from './app/component';
export {default as ComponentController} from './app/component-controller';
export {default as ComponentGenerator} from './template/component-generator';
export {default as Behavior} from './app/behavior';
export {default as Template} from './template/template';
export {default as Route} from './components/route';
export {default as assign} from './change-detection/assign';
export {watch, unwatch} from './change-detection/watch';

export function bootstrap(component: Component, template: Template, node: Element) {
    var controller = new ComponentController(Component, node, component);
    
    console.log(controller);
    
    template.compile(node, component, controller);
}
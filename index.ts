/// <reference path="mahalo.d.ts" />

import Component from './app/component';
import ComponentController from './app/component-controller';
import asap from './utils/asap';

export {default as config} from './config';
export {default as Scope} from './app/scope';
export {default as Component} from './app/component';
export {default as ComponentController} from './app/component-controller';
export {default as ComponentGenerator} from './template/component-generator';
export {default as Behavior} from './app/behavior';
export {default as Template} from './template/index';
export {default as Expression} from './expression/index';
export {default as Show} from './components/show';
export {default as For} from './components/for';
export {default as Route} from './components/route';
export {default as Form} from './components/form';
export {default as filters} from './expression/filters';
export {default as assign} from './change-detection/assign';
export {default as keyPath} from './utils/key-path';
export {watch, unwatch} from './change-detection/key-path';

export function bootstrap(component: Component, template: Template, node: Element) {
    asap(() => {
        var controller = new ComponentController(Component, node, component);
        
        console.log(controller);
        
        template.compile(node, component, controller);
    });
}
/**
 * The main module of Mahalo. In general everything you need to
 * work with when creating Mahalo applications can be imported
 * from here.
 * 
 * All exports of [[mahalo]] can be considered public. You might
 * find more goodies in other places of Mahalo's source they
 * could change in the future. 
 */

/// <reference path="mahalo.d.ts" />

/***/

import Component from './app/component';
import ComponentController from './app/component-controller';
import asap from './utils/asap';

export {config} from './config';
export {default as Scope} from './app/scope';
export {default as Component} from './app/component';
export {default as ComponentController} from './app/component-controller';
export {default as ComponentGenerator} from './template/component-generator';
export {default as Behavior} from './app/behavior';
export {default as Template} from './template/index';
export {default as Expression} from './expression/index';
export {default as Anchor} from './components/anchor';
export {default as Show} from './components/show';
export {default as For} from './components/for';
export {default as Route} from './components/route';
export {default as Form} from './components/form';
export {default as Classes} from './behaviors/classes';
export {default as Content} from './behaviors/content';
export {default as Model} from './behaviors/model';
export {default as Link} from './behaviors/link';
export {default as Styles} from './behaviors/styles';
export {filters} from './expression/filters';
export {default as assign} from './change-detection/assign';
export {default as keyPath} from './utils/key-path';
export {watch, unwatch} from './change-detection/key-path';

/**
 * Bootstraps a Mahalo application
 */
export function bootstrap(component: Component, template: ITemplate, node: Element) {
    asap(() => {
        var controller = new ComponentController(Component, node, component);
        
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }

        template.compile(node, component, controller);
    });
}
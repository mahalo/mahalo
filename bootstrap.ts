// @todo: Only needed to change order of importing, might be removable when bootstrapping is optimized
import './template/template';

import ComponentController from './app/component-controller';
import App from './app/app';

export default function bootstrap(app: App, template: Template, node: Element) {
    var controller = new ComponentController(App, node, app);
    
    console.log(controller);
    
    template.compile(node, app, controller);
}
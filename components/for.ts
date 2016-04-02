import Component from '../app/component';
import ComponentGenerator from '../template/component-generator';
import ComponentController from '../app/component-controller';
import assign from '../change-detection/assign';

export default class For extends Component {
    static inject = {
        element: Element,
        generator: ComponentGenerator,
        controller: ComponentController
    };
    
    static attributes = {each: '', of: '.'};
    
    static bindings = {of: 'update'};
    
    static template = '';
    
    element: Element;
    
    controller: ComponentController;
    
    generator: ComponentGenerator;
    
    each: string;
    
    of: Object;
    
    template: Element;
    
    children: Array<ComponentController>;
    
    constructor() {
        super();
        
        var template = document.createElement(this.each),
            attributes = this.element.attributes,
            attribute = attributes[0],
            i = 0,
            name;
        
        while (attribute) {
            name = attribute.name;
            name === 'each' || name === 'of' || template.setAttribute(name, attribute.value);
            attribute = attributes[++i];
        }
        
        this.template = template;
        
        this.children = [];
        
        this.update(this.of);
    }
    
    update(obj) {
        this.controller.children.forEach(
            (controller: ComponentController) => controller.isLeaving && controller.remove()
        );
        
        if (Array.isArray(obj)) {
            return this._prepareArray(obj);
        }
        
        if (obj instanceof Object) {
            return this._prepareObject(obj);
        }
    }
    
    _prepareArray(arr: Array<any>) {
        var children = [],
            len = arr.length,
            i = 0;
        
        while (i < len) {
            children.push(this._hasPrevious(arr, i, i++));
        }
        
        this._setPrevious(children);
    }
    
    _prepareObject(obj: Object) {
        var children = [],
            keys = Object.keys(obj),
            len = keys.length,
            i = 0;
        
        while (i < len) {
            children.push(this._hasPrevious(obj, keys[i], i++));
        }
        
        this._setPrevious(children);
    }
    
    _hasPrevious(obj, key, i) {
        var children = this.children,
            each = this.each,
            value = obj[key],
            controller = children.find(
                childController => childController.component[each] === value
            );
        
        if (controller) {
            children.splice(children.indexOf(controller), 1);
            
            var component = controller.component,
                forItem = component instanceof ForItem && component;
            
            assign(forItem, '$key', key);
            assign(forItem, '$index', i);
            controller.append(this.element);
        } else {
            controller = this._createController(obj, key, i);
        }
        
        return controller;
    }

    _setPrevious(children: Array<ComponentController>) {
        var len = children.length;
        
        this.children.reverse();
        this.children.forEach(controller => controller.detach());
        this.children = children;
        
        children.forEach((controller, i) => controller.position = len - i);
    }
    
    _createController(obj: Object, key: string|number, index: number) {
        var each = this.each,
            element = this.template.cloneNode(),
            controller = this.controller,
            generator = this.generator,
            itemController = new ComponentController(
                ForItem,
                element instanceof Element && element,
                controller.scope,
                controller,
                {
                    [each]: '',
                    $key: '',
                    $index: ''
                }
            ),
            component = itemController.component,
            _component = component instanceof ForItem && component;
        
        _component[each] = obj[key];
        _component.$key = key;
        _component.$index = index;
        
        itemController.init(this.element, generator.children, generator.behaviors);
        
        return itemController;
    }
}

class ForItem extends Component {
    $key: string|number;
    
    $index: number;
}
import {ComponentController} from '../index';

export interface IController {
    node: Node;
    
    parent: ComponentController;
    
    remove();
    
    removeChildren();
}
import {Scope, Component, ComponentController} from '../index';

export interface IGenerator {
    node: Node;
    
    compile(parentNode: Element|DocumentFragment, scope: Scope|Component, controller: ComponentController): void;
}
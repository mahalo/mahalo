/**
 * 
 */

/**
 * 
 */
export default class ChildrenGenerator implements IGenerator {
    node: Node;
    
    constructor(node) {
        this.node = node;
    }
    
    compile(parentNode: DocumentFragment) {
        parentNode.appendChild(this.node.cloneNode());
    }
}
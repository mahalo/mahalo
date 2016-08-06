/**
 * This module is responsible for handling children tags.
 */

/**
 * A generator that handles the special children tag. It ensures
 * that it has no own contents.
 */
export default class ChildrenGenerator implements IGenerator {
    /**
     * The node that will be cloned.
     */
    node: Node;
    
    constructor(node) {
        this.node = node;
    }
    
    /**
     * Compiles the node.
     */
    compile(parentNode: DocumentFragment) {
        parentNode.appendChild(this.node.cloneNode());
    }
}
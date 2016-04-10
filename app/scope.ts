/**
 * 
 */

/**
 * @alias {Scope} from mahalo
 */
export default class Scope implements IScope {
    constructor(scope: Scope|IComponent, component: IComponent, keys: Object) {		
        scopes.set(this, scope);
        components.set(this, component);
        localKeys.set(this, keys);
    }
}

/**
 * 
 */
export function getComponent(key: string|number): IComponent {
    var scope = scopes.get(this);
    
    if (localKeys.get(this).indexOf(key) > -1) {
        return components.get(this);
    }
    
    return scope instanceof Scope ? getComponent.call(scope, key) : scope;
}


//////////


var scopes = new WeakMap(),
    components = new WeakMap(),
    localKeys = new WeakMap();
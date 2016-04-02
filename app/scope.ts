var scopes = new WeakMap(),
    components = new WeakMap(),
    localKeys = new WeakMap();

export default class Scope {
    constructor(scope: Scope|Component, component: Component, keys: Object) {		
        scopes.set(this, scope);
        components.set(this, component);
        localKeys.set(this, keys);
    }
}

export function getComponent(key: string|number): Component {
    var scope = scopes.get(this);
    
    if (localKeys.get(this).indexOf(key) > -1) {
        return components.get(this);
    }
    
    return scope instanceof Scope ? getComponent.call(scope, key) : scope;
}
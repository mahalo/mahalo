/**
 * This module is responsible for dealing with scopes.
 */

/**
 * Scopes are a rather advanced concept in Mahalo and in general you
 * don't have to deal with them at all.
 * 
 * If you really need them it is recommended to use [[mahalo.keyPath]]
 * for retrieving values and [[mahalo.Expression]] for more complex
 * evaluation.
 * 
 * A scope is just a proxy object that is connected to its parent
 * scope and the local component. In combination with [[mahalo/app/scope#getcomponent]]
 * you can get the correct component for looking up a key in the scope.
 * 
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
 * This function returns the component instance that holds the given
 * key in the scope that is the binding context.
 * 
 * It will first look if the key should be provided by the local component
 * which will be returned in that case.
 * 
 * Otherwise it will return the parent scope if it is a component or call
 * itself with the parent scope as binding context if it is also a scope.
 * 
 * ##### Example
 * 
 * ```javascript
 * var component = getComponent.call(scope, 'myProperty'),
 *     value = component.myProperty;
 * ```
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
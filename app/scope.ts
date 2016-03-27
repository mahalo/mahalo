var scopes = new WeakMap(),
	components = new WeakMap(),
	localKeys = new WeakMap();

export default class Scope {
	constructor(scope: Scope|Component, component: Component, keys: Object) {
		var key;
		
		for (key in keys) {
			if (keys.hasOwnProperty(key)) {
				createKey(this, component, key);
			}
		}
		
		for (key in scope) {
			if (scope.hasOwnProperty(key) && !this.hasOwnProperty(key)) {
				createKey(this, scope, key);
			}
		}
		
		scopes.set(this, scope);
		components.set(this, component);
		localKeys.set(this, keys);
	}
}

export function getComponent(key: string|number): Component {
	var scope = scopes.get(this);
	
	if (localKeys.get(this).hasOwnProperty(key)) {
		return components.get(this);
	}
	
	return scope instanceof Scope ? getComponent.call(scope, key) : scope;
}

function createKey(scope: Scope, component: Component|Scope, key: string) {
	component = component instanceof Scope ? getComponent.call(component, key) : component;
	
	Object.defineProperty(scope, key, {
		enumerable: true,
		get() {
			return component[key];
		}
	});
}
import asap from '../utils/asap';
import notify from './callbacks';

var changes = new WeakMap();

export function createChange(obj, key, oldVal?) {
	var change = {
			name: key + '',
			object: obj,
			type: 'add'
		};

	if (arguments.length === 3) {
		change.oldValue = oldVal;
		change.type = 'update';
	}

	if (!obj.hasOwnProperty(key)) {
		change.type = 'delete';
	}

	pushChange(obj, change);
}

export function pushChange(obj, change) {
	var objectChanges = changes.get(obj);

	if (!objectChanges) {
		objectChanges = [];
		changes.set(obj, objectChanges);
	}

	objectChanges.push(change);

	if (objectChanges.length === 1) {
		asap(function() {
			notify(obj, objectChanges);
			changes.delete(obj);
		});
	}
}
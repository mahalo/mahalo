import isObject from './isObject';

export function toKeys(str) {
	var keys = [],
		key = '',
		char = str[0],
		i = 0,
		esc = false;

	while (char) {
		if (char === '^' && !esc) {
			esc = true;
		} else if (char === '.' && !esc) {
			keys.push(key);
			key = '';
			esc = false;
		} else {
			key += char;
			esc = false;
		}
		
		char = str[++i];
	}

	keys.push(key);

	return keys;
}

export function toKeyPath(keys) {
	var i;
	
	if (typeof keys === 'string') {
		keys = [keys];
	}
	
	i = keys.length;
	
	while (i--) {
		keys[i] = keys[i].replace('^', '^^').replace('.', '^.');
	}
	
	return keys.join('.');
}

export default function keyPath(obj, kPath, val?) {
	if (!isObject(obj)) {
		return;
	}
	
    var keys = toKeys(kPath),
        key = keys[0],
        len = keys.length - 1,
        i = 0,
        args = arguments.length;

    while (i < len) {
        key = keys[i++];

        if (typeof obj[key] === 'undefined') {
            if (args < 3) {
                return;
            }

            obj[key] = {};
        }

        obj = obj[key];

        if (!isObject(obj)) {
            return;
        }
    }

    if (args > 2) {
        return obj[keys[i]] = val;
    }

    return obj[keys[i]];
}
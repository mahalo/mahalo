export function toKeys(str) {
	var keys = [],
		buffer = '',
		char = str[0],
		prev = '',
		i = 0,
		esc = false;

	while (char) {
		if (char === '.') {
			if (prev === '.' && !esc) {
				buffer += char;
				esc = true;
			} else {
				esc = false;
			}
		} else {
			if (prev === '.' && !esc) {
				keys.push(buffer);
				buffer = char;
			} else {
				buffer += char;
			}
			esc = false;
		}

		prev = char;
		char = str[++i];
	}

	keys.push(buffer);

	return keys;
}

export function toKeyPath(keys) {
	var path = '',
		i = 0,
		str;
	
	if (typeof keys === 'string') {
		keys = [keys];
	}
	
	str = keys[0];
	
	while (str) {
		path += (i ? '.' : '') + str.replace('.', '..');
		
		str = keys[++i];
	}
	
	return path;
}

export default function keyPath(obj, kPath, val?) {
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

        if (!Object.isObject(obj)) {
            return;
        }
    }

    if (args > 2) {
        return obj[keys[i]] = val;
    }

    return obj[keys[i]];
}
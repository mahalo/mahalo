/**
 * xs.js - utils/equals
 * 
 * @since 0.5
 * @author Markus Schmidt
 */

export default function equals(x, y) {
	var seenX = [],
		seenY = [];

	function eqls(x, y) {
		var i,
			p;

		// If both x and y are null or undefined and exactly the same
		if (x === y) {
			return true;
		}

		// If they are not strictly equal they both need to be objects
		if (!(x instanceof Object) || !(y instanceof Object)) {
			return false;
		}

		for (p in x) {
			// Allows comparing x[p] and y[p] when set to undefined
			if (!y.hasOwnProperty(p)) {
				return false;
			}

			// If they have the same strict value or identity then they are equal
			if (x[p] === y[p]) {
				continue;
			}

			// Numbers, Strings, Functions, Booleans must be strictly equal
			if (typeof (x[p]) !== 'object') {
				return false;
			}

			// Test cyclicality
			i = seenX.indexOf(x[p]);
			if (i !== -1) {
				if (y[p] !== seenY[i]) {
					return false;
				}
			} else {
				seenX.push(x[p]);
				seenY.push(y[p]);

				// Objects and Arrays must be tested recursively
				if (!eqls(x[p], y[p])) {
					return false;
				}
			}
		}

		for (p in y) {
			// allows x[ p ] to be set to undefined
			if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) {
				return false;
			}
		}

		return true;
	}

	return eqls(x, y);
}
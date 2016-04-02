/**
 * mahalo/utils/equals
 * 
 * @since 0.5
 * @author Markus Schmidt
 */

export default function equals(x, y) {
    var key;
    
    // If both x and y are null or undefined and exactly the same
    if (x === y) {
        return true;
    }
    
    // If they are not strictly equal they both need to be objects
    if (!(x instanceof Object) || !(y instanceof Object)) {
        return false;
    }
    
    // They must have the exact same prototype
    if (Object.getPrototypeOf(x) !== Object.getPrototypeOf(y)) {
        return false;
    }
    
    var keys = Object.keys(x),
        i = keys.length,
        key;
    
    while (i--) {
        key = keys[i];
        
        // Allows comparing x[p] and y[p] when set to undefined
        if (!y.hasOwnProperty(key)) {
            return false;
        }

        // If they have the same strict value or identity then they are equal
        if (x[key] !== y[key]) {
            return false;
        }
    }
    
    keys = Object.keys(y);
    i = keys.length;
    
    while (i--) {
        // allows x[p] to be set to undefined
        if (!x.hasOwnProperty(keys[i])) {
            return false;
        }
    }
    
    return true;
}
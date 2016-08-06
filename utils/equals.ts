/**
 * This module exports the equals function.
 */

/**
 * Checks if two provided values are equal to each other. This is different
 * from '===' in that it checks objects for equal own properties. This allows
 * for checking objects against their clones created with [[mahalo/utils/clone.default]]. 
 */
export default function equals(x, y) {
    var key;
    
    // If both x and y are the same.
    if (x === y) {
        return true;
    }
    
    // Make sure that both are objects.
    if (!(x instanceof Object) || !(y instanceof Object)) {
        return false;
    }
    
    // Check if both have the same prototype.
    if (Object.getPrototypeOf(x) !== Object.getPrototypeOf(y)) {
        return false;
    }
    
    var keys = Object.keys(x),
        i = keys.length,
        key;
    
    while (i--) {
        key = keys[i];
        
        // Check for properties of x that are not own properties of y.
        if (!y.hasOwnProperty(key)) {
            return false;
        }

        // Check that both values are equal or self references.
        if (x[key] !== y[key] && (x[key] !== x || y[key] === y)) {
            return false;
        }
    }
    
    keys = Object.keys(y);
    i = keys.length;
    
    while (i--) {
        // Check for properties of y that are not own properties of x.
        if (!x.hasOwnProperty(keys[i])) {
            return false;
        }
    }
    
    return true;
}
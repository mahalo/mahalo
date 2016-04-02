var assign = require('../../change-detection/assign').default,
    property = require('../../change-detection/property'),
    observe = property.observe,
    unobserve = property.unobserve;

describe('change detection: property', function() {
    var obj = {
            key: 0
        },
        local = 10,
        called = 0;
    
    Object.defineProperty(obj, 'computed', {
        get: function() {
            return local;
        }
    });
    
    observe(obj, 'key', callback);
    observe(obj, 'computed', callback);
    
    describe('member assignments', function() {
        beforeEach(function(done) {
            assign(obj, 'key', 1);
            setTimeout(done, 100);
        });
        
        it('should react to changes', function() {
            expect(called).toBe(1);
        });
    });
    
    describe('computed properties', function() {
        beforeEach(function(done) {
            assign(local++);
            setTimeout(done, 100);
        });
        
        it('should react to changes', function() {
            expect(called).toBe(11);
        });
    });
    
    afterAll(function() {
        unobserve(obj, 'key', callback);
        unobserve(obj, 'computed', callback);
    });
    
    function callback(obj, key, oldVal) {
        called = obj[key];
    }
});
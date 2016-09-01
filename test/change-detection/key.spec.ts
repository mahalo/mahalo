import {assign} from '../../index';
import {observe, unobserve} from '../../change-detection/key';

describe('change detection: key:', function() {
    let obj = {
        key: 0
    };
    let local = 10;
    let called = 0;
    
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
var assign = require('access-core/change-detection/property').assign,
	watcher = require('access-core/change-detection/watch'),
	watch = watcher.watch,
	unwatch = watcher.unwatch;

describe('change detection: watcher', function() {
	var obj = {
			child: {},
			list: []
		},
		local = 10,
		called = 0;
	
	GrandChild.prototype.property = 1;
	
	Object.defineProperty(obj.child, 'computed', {
		get: function() {
			return local;
		}
	});
	
	watch(obj, 'child.computed', callback);
	watch(obj, 'child.grandChild.created', callback);
	watch(obj, 'child.grandChild', callback);
	watch(obj, 'list', callback);
	
	describe('computed properties', function() {
		beforeEach(function(done) {
			assign(local++);
			setTimeout(done, 100);
		});
		
		it('should react to changes', function() {
			expect(called).toBe(11);
		});
	});
	
	describe('undefined grand Child', function() {
		beforeEach(function(done) {
			assign(obj.child, 'grandChild', new GrandChild(20));
			setTimeout(done, 100);
		});
		
		it('should react to changes', function() {
			expect(called).toEqual(new GrandChild(20));
		});
	});
	
	describe('undefined grand Child properties', function() {
		beforeEach(function(done) {
			assign(obj.child.grandChild, 'created', 30);
			setTimeout(done, 100);
		});
		
		it('should react to changes', function() {
			expect(called).toEqual(new GrandChild(30));
		});
	});
	
	describe('array changes', function() {
		beforeEach(function(done) {
			obj.list.push(1);
			setTimeout(done, 100);
		});
		
		it('should react to changes', function() {
			expect(called).toEqual([1]);
		});
	});
	
	afterAll(function() {
		unwatch(obj, 'child.computed', callback);
		unwatch(obj, 'child.grandChild.created', callback);
		unwatch(obj, 'child.grandChild', callback);
		unwatch(obj, 'list', callback);
	});
	
	function GrandChild(created) {
		this.created = created;
	}
	
	function callback(newValue, oldValue) {
		called = newValue;
	}
});
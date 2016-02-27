var Test = require('./watch.test'),
	watch = require('access-core/watcher/watch'),
	unwatch = watch.unwatch;

watch = watch.watch;

describe('Watchables', function() {
	var test = new Test['default'](),
		getter = null;
		
	watch(test, 'getter', update);
	
	describe('private variable updates', function() {
		beforeEach(function(done) {
			Test.updateA();
			window.setTimeout(done, 100);
		});
		
		it('should react to changes', function() {
			expect(getter).toBe(12);
		});
	});
	
	describe('local function updates', function() {
		beforeEach(function(done) {
			Test.updateB();
			window.setTimeout(done, 100);
		});
		
		it('should react to changes', function() {
			expect(getter).toBe(13);
		});
	});
	
	describe('member updates', function() {
		beforeEach(function(done) {
			test.value++;
			window.setTimeout(done, 100);
		});
		
		it('should react to changes', function() {
			expect(getter).toBe(14);
		});
	});
	
	afterAll(function() {
		unwatch(test, 'getter', update);
	});
	
	function update(newVal) {
		getter = newVal;
	}
});
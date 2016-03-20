var Expression = require('../../expression/expression')['default'];

describe('Expression', function() {
    it('should be able to access members', function() {
        var exp1 = new Expression('x.y.z + 1 * 2', {x: {y: {z: 1}}}),
			exp2 = new Expression('{foo: "bar", bar: "baz"}', {}),
			exp3 = new Expression('.["bar ]"] + .["baz"]', {'bar ]': 'bar', baz: 'baz'}),
			exp4 = new Expression('[1, 2, 3].length', {}),
			exp5 = new Expression('(true)', {});
			exp6 = new Expression('foo | date: true', {foo: '12/1/84'});
			exp7 = new Expression('foo(bar)', {foo: bar => {return bar}, bar: 'bar'});
		
		expect(exp1.value).toBe(3);
		expect(exp2.value).toEqual({foo: 'bar', bar: 'baz'});
		expect(exp3.value).toBe('barbaz');
		expect(exp4.value).toEqual(3);
		expect(exp5.value).toBe(true);
		expect(exp6.value).toBe('1/12/1984');
		expect(exp7.value).toBe('bar');
    });
});
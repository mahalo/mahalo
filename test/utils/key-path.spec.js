var keyPath = require('../../utils/key-path'),
	toKeys = keyPath.toKeys,
	toKeyPath = keyPath.toKeyPath;

describe('KeyPath', function() {
    it('should convert paths to key arrays', function() {
		expect(toKeys('foo.bar')).toEqual(['foo', 'bar']);
		expect(toKeys('foo^..^.bar')).toEqual(['foo.', '.bar']);
		expect(toKeys('foo^^.^.bar')).toEqual(['foo^', '.bar']);
		expect(toKeys('foo^^bar.^.baz')).toEqual(['foo^bar', '.baz']);
    });
	
	it('should convert keys to paths', function() {
		expect(toKeyPath(['foo', 'bar'])).toBe('foo.bar');
		expect(toKeyPath(['foo.', '.bar'])).toEqual('foo^..^.bar');
		expect(toKeyPath(['foo^', '.bar'])).toEqual('foo^^.^.bar');
		expect(toKeyPath(['foo^bar', '.baz'])).toEqual('foo^^bar.^.baz');
    });
});
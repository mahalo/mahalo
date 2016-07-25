import {default as keyPath, toKeyPath, toKeys} from '../../utils/key-path';

describe('KeyPath', () => {
    it('should convert paths to key arrays', () => {
        expect(toKeys('foo.bar')).toEqual(['foo', 'bar']);
        expect(toKeys('foo^..^.bar')).toEqual(['foo.', '.bar']);
        expect(toKeys('foo^^.^.bar')).toEqual(['foo^', '.bar']);
        expect(toKeys('foo^^bar.^.baz')).toEqual(['foo^bar', '.baz']);
    });
    
    it('should convert keys to paths', () => {
        expect(toKeyPath(['foo', 'bar'])).toBe('foo.bar');
        expect(toKeyPath(['foo.', '.bar'])).toEqual('foo^..^.bar');
        expect(toKeyPath(['foo^', '.bar'])).toEqual('foo^^.^.bar');
        expect(toKeyPath(['foo^bar', '.baz'])).toEqual('foo^^bar.^.baz');
    });
});
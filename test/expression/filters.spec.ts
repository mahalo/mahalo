import {filters} from '../../index';

describe('Filters', function() {
    it('should convert to date format', function() {
        expect(filters.date('2016-04-03')).toBe('04/03/2016 02:00');
    });
    
    it('should convert to number format', function() {
        expect(filters.number('3214388643.87532')).toBe('3,214,388,643.88');
        expect(filters.number('3214388643.87532', '1000,0')).toBe('3214388643,9'); 
    });
});
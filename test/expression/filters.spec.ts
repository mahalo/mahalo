var filters = require('../../expression/filters').default;

describe('Filters', function() {
    it('should convert to date format', function() {
        expect(filters.date('2016-04-03')).toBe('04/03/2016');
    });
});
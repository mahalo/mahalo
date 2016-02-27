var Expression = require('access-core/expression/parser');

describe('Expression', function() {
    it('should be able to access members', function() {
        var result = new Expression('x.y.z + 1 * 2')
			.compile({
				x: {
					y: {
						z: 1
					}
				}
			});
		
		expect(result).toBe(3);
    });
});
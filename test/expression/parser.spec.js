var Expression = require('../../expression/parser')['default'];

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
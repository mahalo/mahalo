var Expression = require('../../expression/expression')['default'];

describe('Expression', function() {
    it('should be able to access members', function() {
        var result = new Expression('x.y.z + 1 * 2', {
				x: {
					y: {
						z: 1
					}
				}
			}).value;
		
		expect(result).toBe(3);
    });
});
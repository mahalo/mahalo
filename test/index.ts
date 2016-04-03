// @todo: Add more tests when Mahalo gets closer to 1.0
var specsContext = require.context('.', true, /\.spec\.ts$/);

specsContext.keys().forEach(specsContext);
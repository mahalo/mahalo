// @todo: Add more tests when Mahalo gets closer to 1.0
var specsContext = require.context('.', true, /\.spec\.js$/);

specsContext.keys().forEach(specsContext);
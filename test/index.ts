var specsContext = require.context('.', true, /\.spec\.ts$/);

specsContext.keys().forEach(specsContext);
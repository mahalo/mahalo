module.exports = function (config) {
    config.set({
        frameworks: ['jasmine'],
        browsers: ['Chrome'],
        files: [
            'test/index.js'
        ],
        preprocessors: {
            'test/index.js': ['webpack']
        },
        webpack: {
            module: {
                loaders: [
                    {
                        test: /\.html$/,
                        loader: 'access'
                    }
                ]
            },
			resolve: {
				root: ['node_modules', '..']
			},
			devtool: 'eval'
        }
    });
};
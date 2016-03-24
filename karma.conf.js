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
						test: /\.ts$/,
						loader: 'babel',
						query: {
							presets: [
								'es2015',
								'stage-1'
							],
							plugins: [
								'external-helpers',
								'transform-flow-strip-types',
								// 'transform-runtime'
							]
						}
					}
                ]
            },
			resolve: {
				extensions: ['', '.js', '.ts']
			},
			devtool: 'eval'
        }
    });
};
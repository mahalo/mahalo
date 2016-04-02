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
                            presets: ['es2015'],
                            plugins: [
                                'transform-class-properties',
                                ['transform-es2015-classes', {loose: true}],
                                'transform-flow-strip-types',
                                'transform-runtime'
                            ]
                        }
                    }
                ]
            },
            resolve: {
                extensions: ['', '.js', '.ts']
            },
            devtool: 'source-map'
        }
    });
};
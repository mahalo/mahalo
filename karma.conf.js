module.exports = function (config) {
    config.set({
        frameworks: ['jasmine'],
        browsers: ['Chrome'],
        files: [
            'test/index.ts'
        ],
        preprocessors: {
            'test/index.ts': ['webpack']
        },
        webpack: {
            module: {
                loaders: [
                    {
                        test: /\.(t|j)s$/,
                        loader: 'babel',
                        query: {
                            presets: ['es2015'],
                            plugins: [
                                'transform-class-properties',
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
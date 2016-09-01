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
            resolve: {
                extensions: ['', '.js', '.ts']
            },
            module: {
                loaders: [
                    {
                        test: /\.ts$/,
                        loader: 'mahalo'
                    }
                ]
            },
            devtool: 'source-map'
        }
    });
};
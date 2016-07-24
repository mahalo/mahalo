const query = {
    presets: ['es2015'],
    plugins: [
        'transform-class-properties',
        'transform-flow-strip-types',
        'transform-runtime'
    ]
};

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
                        test: /\.js$/,
                        loader: 'babel',
                        include: /test/,
                        query: query
                    },
                    {
                        test: /\.ts$/,
                        loader: 'babel',
                        query: query
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
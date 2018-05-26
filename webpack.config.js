const path = require('path');

module.exports = {
    module: {
        rules: [{
            test: require.resolve('./src/renderer'),
            use: [{
                loader: 'babel-loader',
            }],
        }],
    },
    entry: './src/renderer.js',
    output: {
        filename: 'renderer.js',
        path: path.resolve(__dirname, 'build'),
    },
};

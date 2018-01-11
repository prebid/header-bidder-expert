'use strict';

module.exports = {
    output: {
        filename: 'entry-bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader',
                query: {
                    presets: [
                        ['es2015', { modules: false }],
                    ],
                },
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(jpe?g|png|gif)$/i,
                use: ['file-loader?name=../../../img/webpack/[hash]/[name].[ext]']
            },
        ]
    },
};

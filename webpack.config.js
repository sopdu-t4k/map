const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MinifyPlugin = require('babel-minify-webpack-plugin');

let _path = {
    src: 'public_html/src',
    dist: 'public_html/dist'
};

module.exports = {
    entry: {main: path.resolve(__dirname, _path.src, 'index.js')},
    output: {
        path: path.resolve(__dirname, _path.dist),
        filename: 'bundle.js',
        assetModuleFilename: 'images/[name][ext]',
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                }
            },
            {
                test: /\.s[ac]ss$/i,
                include: path.resolve(__dirname, _path.src, 'css'),
                use: [
                    MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader',
                ]
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                include: path.resolve(__dirname, _path.src, 'images'),
                type: 'asset/resource',
            },
        ],
    },
    optimization: {
        minimizer: [
            new CssMinimizerPlugin(),
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({filename: 'style.css'}),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, _path.src, 'index.html'),
            filename: 'index.html',
            favicon: path.resolve(__dirname, _path.src, 'favicon.ico'),
            hash: true
        }),
        new MinifyPlugin(),
    ]
};

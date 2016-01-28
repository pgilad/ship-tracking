'use strict';

// Modules
var webpack = require('webpack');
var autoprefixer = require('autoprefixer-core');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = function makeWebpackConfig(options) {
    var BUILD = !!options.BUILD;

    var config = {};

    config.entry = {
        app: './src/app.js'
    }

    config.output = {
        // Absolute output directory
        path: __dirname + '/public',

        // Output path from the view of the page
        // Uses webpack-dev-server in development
        publicPath: BUILD ? '/' : 'http://localhost:8080/',

        // Filename for entry points
        // Only adds hash in build mode
        filename: BUILD ? '[name].[hash].js' : '[name].bundle.js',

        // Filename for non-entry points
        // Only adds hash in build mode
        chunkFilename: BUILD ? '[name].[hash].js' : '[name].bundle.js'
    }

    if (BUILD) {
        config.devtool = null;
        config.debug = null;
    } else {
        config.devtool = 'eval';
    }

    config.module = {
        preLoaders: [],
        loaders: [{
            test: /\.js$/,
            loaders: ['ng-annotate-loader', 'babel-loader'],
            exclude: /node_modules/
        }, {
            test: /\.less$/,
            loader: ExtractTextPlugin.extract('style-loader', 'css-loader?sourceMap!postcss-loader!less-loader?sourceMap')
        }, {
            test: /\.css/,
            loader: ExtractTextPlugin.extract('style-loader', 'css-loader?sourceMap!postcss-loader')
        },{
            test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
            loader: 'file-loader'
        }, {
            test: /\.json/,
            loader: 'json-loader'
        }, {
            test: /\.html$/,
            loader: 'raw-loader'
        }]
    };

    config.postcss = [
        autoprefixer({
            browsers: ['last 2 version']
        })
    ];

    /**
     * Plugins
     * Reference: http://webpack.github.io/docs/configuration.html#plugins
     * List: http://webpack.github.io/docs/list-of-plugins.html
     */
    config.plugins = [
        // Reference: https://github.com/webpack/extract-text-webpack-plugin
        // Extract css files
        // Disabled when in test mode or not in build mode
        new ExtractTextPlugin('[name].[hash].css', {
            disable: !BUILD
        })
    ];

    // Reference: https://github.com/ampedandwired/html-webpack-plugin
    // Render index.html
    config.plugins.push(
        new HtmlWebpackPlugin({
            template: './src/index.html',
            inject: 'body'
        })
    )

    // Add build specific plugins
    if (BUILD) {
        config.plugins.push(
            // Reference: http://webpack.github.io/docs/list-of-plugins.html#noerrorsplugin
            // Only emit files when there are no errors
            new webpack.NoErrorsPlugin(),

            // Reference: http://webpack.github.io/docs/list-of-plugins.html#dedupeplugin
            // Dedupe modules in the output
            new webpack.optimize.DedupePlugin()

            // Reference: http://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
            // Minify all javascript, switch loaders to minimizing mode
            // new webpack.optimize.UglifyJsPlugin()
        )
    }

    config.devServer = {
        contentBase: './public',
        stats: {
            modules: false,
            cached: false,
            colors: true,
            chunk: false
        },
        proxy: {
            "/*": "http://localhost:3000/",
        },
    };

    return config;
};

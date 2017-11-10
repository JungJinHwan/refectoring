import config from './config';
import webpack from 'webpack';

module.exports = {
    entry: './src/'+config.dir+'/js/'+config.name+'/main.js',

    output: {
        path: __dirname + '/dist/'+config.dir+'/js/'+config.name,
        filename: config.name+'.min.js'
    },

    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            query: {
                cacheDirectory: true,
                presets: ['es2015', 'react']
            }
        }]
    },

    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: true
            }
        })
    ]
};
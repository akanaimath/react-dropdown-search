var webpack = require('webpack');
var path = require('path');
var BUILD_DIR = path.resolve(__dirname, 'demo');
var APP_DIR = path.resolve(__dirname, '.');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

var config = {
	entry: [
		'babel-polyfill',
		APP_DIR + '/src/DropdownSearch.css',
		BUILD_DIR + '/demo.jsx'
	],
	target: 'web',
	output: {
		path: BUILD_DIR,
		filename: 'site.js',

	},
	devtool: '#eval-source-map',
	module: {
		loaders: [
			{
				test: /\.jsx?$/,
				loader: "babel-loader",
				exclude: /node_modules/,
				query: {
					compact: false,
					presets: [['react'], ['env', {}]],
					plugins: [
						"babel-plugin-transform-react-jsx",
						"transform-class-properties",
					]

				}
			}, {
				test: /\.css$/,
				loaders: ["style-loader", "css-loader"],
			}, {
				test: /\.(jpe?g|png|gif)$/i,
				loader: "file-loader",
				query: {
					name: '[name].[ext]',
					outputPath: 'images/'
				}
			}, {
				test : /\.(jpe?g|png|gif)$/i,
				loader : "file-loader",
				query : {
					name : '[name].[ext]',
					outputPath : 'images/'
				}
			},  {
				test : /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
				loader : 'url-loader?limit=100000',
				query : {
					name : '[name].[ext]',
					outputPath : 'fonts/'
				}
			}, {
				test : /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
				loader : 'url-loader?limit=100000',
				query : {
					name : '[name].[ext]',
					outputPath : 'fonts/'
				}
			}, {
				test : /\.eot(\?v=\d+\.\d+\.\d+)?$/,
				loader : 'url-loader?limit=100000',
				query : {
					name : '[name].[ext]',
					outputPath : 'fonts/'
				}
			}, {
				test : /\.svg(\?v=\d+\.\d+\.\d+)?$/,
				loader : 'url-loader?limit=100000',
				query : {
					name : '[name].[ext]',
					outputPath : 'fonts/'
				}
			} ],
	},
	// optimization: {
	// 	minimizer: [
	// 		// we specify a custom UglifyJsPlugin here to get source maps in production
	// 		new UglifyJsPlugin({
	// 			cache: true,
	// 			parallel: true,
	// 			uglifyOptions: {
	// 				compress: false,
	// 				ecma: 6,
	// 				mangle: true
	// 			},
	// 			sourceMap: true
	// 		})
	// 	]
	// },
	plugins: [
		new webpack.optimize.UglifyJsPlugin({
			sourceMap: true,
			warnings: true,
			uglifyOptions: {},
		})
	],
};

module.exports = config;
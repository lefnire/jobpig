'use strict';

const webpack = require('webpack');
const path = require('path');
const nconf = require('nconf');
const TransferWebpackPlugin = require('transfer-webpack-plugin');
const StringReplacePlugin = require("string-replace-webpack-plugin");
const Clean = require('clean-webpack-plugin');
const S3Plugin = require('webpack-s3-plugin');
const _ = require('lodash');

nconf.argv().env().file({ file: 'config.json' });
const prod = nconf.get('NODE_ENV') === 'production';
const buildPath = path.resolve(__dirname, 'client/build');
const nodeModulesPath = path.resolve(__dirname, 'node_modules');

let config = {
  //Entry points to the project
  entry: (prod ? [] :
    ['webpack/hot/dev-server',
    'webpack/hot/only-dev-server'])
    .concat(path.join(__dirname, 'client/src/app/Index')),
  //Config options on how to interpret requires imports
  resolve: { // FIXME remove?
    //When require, do not have to add these extensions to file's name
    extensions: ["", ".js", ".jsx"]
    //node_modules: ["web_modules", "node_modules"]  (Default Settings)
  },
  //Render source-map file for final build
  devtool: prod ? 'source-map' : 'eval',
  //output config
  output: {
    path: buildPath,    //Path of output file
    filename: 'app.js'  //Name of output file
  },
  plugins: [
    // Clean up first // FIXME remove?
    new Clean(['client/build']),

    // Replace <nconf:*>
    new StringReplacePlugin(),

    // Uglify in prod, module hot-loading in dev
    prod ? new webpack.optimize.UglifyJsPlugin({
        minimize: true,
        compress: { warnings: false } //supresses warnings, usually from module minification
      })
    : new webpack.HotModuleReplacementPlugin(),

    // Allows error warnings but does not stop compiling. Will remove when eslint is added
    new webpack.NoErrorsPlugin(),

    // Copy // FIXME remove?
    new TransferWebpackPlugin([
      {from: 'client/src/www'},
      //{from: 'node_modules/css-social-buttons/css', to: 'node_modules/css-social-buttons/css'}
      //{from: 'node_modules/react-select/dist', to: 'node_modules/react-select/dist'}
    ], path.resolve(__dirname, ".")),

    prod? new S3Plugin({
      s3Options: nconf.get('aws:options'),
      s3UploadOptions: nconf.get('aws:upload_options')
    }) : {apply: _.noop}
  ],

  module: {
    //Loaders to interpret non-vanilla javascript code as well as most other extensions including images and text.
    preLoaders: [{
      //Eslint loader
      test: /\.jsx?$/,
      loader: 'eslint-loader',
      include: [path.resolve(__dirname, "client/src/app")],
      exclude: [nodeModulesPath]
    }],
    loaders: [{
      test: /\.jsx?$/,
      loaders: (prod ? [] : ['react-hot']).concat([
        'babel-loader?optional=runtime&stage=0',
        StringReplacePlugin.replace({
          replacements: [{
            // replace server url based on release (ie, localhost:3000 or jobpigapp.herokuapp.com)
            pattern: /<nconf:urls:server>/g,
            replacement: (match, p1, offset, string) => nconf.get('urls:' + (prod ? 'production' : 'development') +':server')
          }, {
            pattern: /<nconf:stripe:public>/g,
            replacement: (match, p1, offset, string) => nconf.get('stripe:' + (prod ? 'production' : 'development') +':public')
          }, {
            // and replace any other configs floating around
            pattern: /<nconf:(.*)>/g,
            replacement: (match, p1, offset, string) => nconf.get(p1)
          }]
        })
      ]),
      exclude: [nodeModulesPath]
    }, {
      test: /\.css$/,
      loader: "style!css" // "style-loader!css-loader?importLoaders=1"
    }, {
      test: /\.(png|woff|woff2|eot|ttf|svg)$/,
      loader: 'url-loader' //'url-loader?limit=100000'
    }]
  },
  //eslint config options. Part of the eslint-loader package
  eslint: {
    configFile: '.eslintrc' //Rules for eslint
  },
};

if (!prod) {
  config.devServer = { //Server Configuration options
    contentBase: '',  //Relative directory for base of server
      devtool: 'eval',
      hot: true,        //Live-reload
      inline: true,
      port: 3001        //Port Number
  };
}

module.exports = config;

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

const entries = prod? [] : ['webpack/hot/dev-server', 'webpack/hot/only-dev-server'];

let config = {
  //Entry points to the project
  entry: {
    app: entries.concat(path.join(__dirname, 'client/src/app/Index')),
    blog: entries.concat(path.join(__dirname, 'client/src/blog/Index'))
  },

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
    filename: "[name].js"
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
        'babel-loader',
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
      loader: "style-loader!css-loader"
    }, {
      test: /\.pcss$/,
      loader: "style-loader!css-loader!postcss-loader"
    }, {
      test: /\.scss$/, loaders: ["style", "css", "sass"]
    }, {
      test: /\.(jpe?g|png|gif|svg)$/i,
      loaders: [
        'url-loader',
        'image-webpack?{progressive:true, optimizationLevel: 7, interlaced: false, pngquant:{quality: "65-90", speed: 4}}'
      ]
    }]
  },
  //eslint config options. Part of the eslint-loader package
  eslint: {
    configFile: '.eslintrc' //Rules for eslint
  },
  postcss: function () {
    return [require('postcss-cssnext')()];
  }
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

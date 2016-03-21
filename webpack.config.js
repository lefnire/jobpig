'use strict';

let webpack = require('webpack');
let path = require('path');
let nconf = require('nconf');
let TransferWebpackPlugin = require('transfer-webpack-plugin');
let StringReplacePlugin = require("string-replace-webpack-plugin");
let Clean = require('clean-webpack-plugin');
let S3Plugin = require('webpack-s3-plugin');

nconf.argv().env().file({ file: 'config.json' });
let prod = nconf.get('NODE_ENV') === 'production';
let buildPath = path.resolve(__dirname, 'client/build');
let nodeModulesPath = path.resolve(__dirname, 'node_modules');

let config = {
  //Entry points to the project
  entry: (prod ? [] :
    ['webpack/hot/dev-server',
    'webpack/hot/only-dev-server'])
    .concat(path.join(__dirname, 'client/src/app/index.jsx')),
  //Config options on how to interpret requires imports
  resolve: {
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
    // Clean up first
    new Clean(['client/build']),

    // Replace <nconf:*>
    new StringReplacePlugin(),

    // Uglify in prod, module hot-loading in dev
    prod? new webpack.optimize.UglifyJsPlugin({
        compress: { warnings: false } //supresses warnings, usually from module minification
      }) :
      new webpack.HotModuleReplacementPlugin(),

    // Allows error warnings but does not stop compiling. Will remove when eslint is added
    new webpack.NoErrorsPlugin(),

    // Copy
    new TransferWebpackPlugin([
      {from: 'client/src/www'},
      //{from: 'node_modules/css-social-buttons/css', to: 'node_modules/css-social-buttons/css'}
      {from: 'node_modules/react-select/dist', to: 'node_modules/react-select/dist'}
    ], path.resolve(__dirname, ".")),

    prod? new S3Plugin({
      s3Options: nconf.get('aws:options'),
      s3UploadOptions: nconf.get('aws:upload_options')
    }) : {apply:()=>{}}
  ],

  module: {
    //Loaders to interpret non-vanilla javascript code as well as most other extensions including images and text.
    preLoaders: [
      {
        //Eslint loader
        test: /\.(js|jsx)$/,
        loader: 'eslint-loader',
        include: [path.resolve(__dirname, "client/src/app")],
        exclude: [nodeModulesPath]
      },
    ],
    loaders: [
      {
        //React-hot loader and
        test: /\.(js|jsx)$/,  //All .js and .jsx files
        loaders: (prod ? [] : ['react-hot'])
          .concat(['babel-loader?optional=runtime&stage=0']), //react-hot is like browser sync and babel loads jsx and es6-7
        exclude: [nodeModulesPath]
      },

      // configure replacements for file patterns
      {
        test: /\.(js|jsx)$/,
        loader: StringReplacePlugin.replace({
          replacements: [
            { // replace server url based on release (ie, localhost:3000 or jobpigapp.herokuapp.com)
              pattern: /<nconf\:urls\:server>/g,
              replacement: (match, p1, offset, string)=> nconf.get('urls:' + (prod ? 'production' : 'development') +':server')
            },
            { // and replace any other configs floating around
              pattern: /<nconf\:(.*)>/g,
              replacement: (match, p1, offset, string)=> nconf.get(p1)
            },
          ]
        })
      }
    ]
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

var webpack = require('webpack');

module.exports = function (config) {
  config.set({

    browsers: ['Chrome'],

    singleRun: true,

    plugins : [
      'karma-chrome-launcher',
      'karma-chai',
      'karma-mocha',
      'karma-sourcemap-loader',
      'karma-webpack',
    ],

    frameworks: [ 'chai', 'mocha' ],

    files: [
      'tests.webpack.js'
    ],

    preprocessors: {
      'tests.webpack.js': [ 'webpack', 'sourcemap' ]
    },

    reporters: [ 'dots' ],

    webpack: {
      devtool: 'inline-source-map',
      module: {
        loaders: [
          {
            test: /\.jsx?$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            query: {
              optional: ["es7.decorators", "es7.classProperties"]
            }
          }
        ]
      }
    },

    webpackServer: {
      noInfo: true
    }

  });
};

'use strict'

process.env.BABEL_ENV = 'main'

const path = require('path')
const { dependencies } = require('../package.json')
const webpack = require('webpack')
const ESLintPlugin = require('eslint-webpack-plugin')


let mainConfig = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: {
    main: path.join(__dirname, '../src/main/index.js')
  },
  externals: [
    ...Object.keys(dependencies || {})
  ],
  module: {
    rules: [

      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.node$/,
        type: 'asset/resource',
        generator: {
          filename: '[name][ext]'
        }
      }
    ]
  },

  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '../dist/electron')
  },
  plugins: [
    new ESLintPlugin({
      extensions: ['js'],
      formatter: require('eslint-friendly-formatter')
    })
  ],
  resolve: {
    extensions: ['.js', '.json', '.node']
  },
  target: 'electron-main'
}

/**
 * Adjust mainConfig for development settings
 */
if (process.env.NODE_ENV !== 'production') {
  mainConfig.plugins.push(
    new webpack.DefinePlugin({
      '__static': `"${path.join(__dirname, '../static').replace(/\\/g, '\\\\')}"`
    })
  )
}

/**
 * Adjust mainConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
  mainConfig.plugins.push(

    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    })
  )
}

module.exports = mainConfig

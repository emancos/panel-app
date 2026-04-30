'use strict'

process.env.BABEL_ENV = 'renderer'

const path = require('path')
const { dependencies } = require('../package.json')
const webpack = require('webpack')

const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const ESLintPlugin = require('eslint-webpack-plugin')

/**
 * List of node_modules to include in webpack bundle
 *
 * Required for specific packages like Vue UI libraries
 * that provide pure *.vue files that need compiling
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/webpack-configurations.html#white-listing-externals
 */
let whiteListedModules = ['vue', 'axios', 'axios-retry', 'vue-router', 'vuex', 'vue-sweetalert2', 'moment', 'promise-queue']

let rendererConfig = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  devtool: 'eval-cheap-module-source-map',
  entry: {
    renderer: path.join(__dirname, '../src/renderer/main.js')
  },
  externals: [
    ...Object.keys(dependencies || {}).filter(d => !whiteListedModules.includes(d))
  ],
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },

      {
        test: /\.scss$/,
        use: ['vue-style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.sass$/,
        use: [
          'vue-style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              api: 'modern-compiler',
              sassOptions: {
                syntax: 'indented'
              }
            }
          }
        ]
      },
      {
        test: /\.less$/,
        use: ['vue-style-loader', 'css-loader', 'less-loader']
      },
      {
        test: /\.css$/,
        use: ['vue-style-loader', 'css-loader']
      },
      {
        test: /\.html$/,
        use: 'html-loader'
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.node$/,
        use: 'node-loader'
      },

      {
        test: /\.(png|jpe?g|gif|svg|mp4|webm|ogg|mp3|wav|flac|aac|woff2?|eot|ttf|otf)(\?.*)?$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name]--[hash][ext]'
        }
      }
    ]
  },

  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({filename: 'styles.css'}),
    new ESLintPlugin({
      extensions: ['js', 'vue'],
      formatter: require('eslint-friendly-formatter')
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, '../src/index.ejs'),
      templateParameters(compilation, assets, options) {
        return {
          compilation: compilation,
          webpack: compilation.getStats().toJson(),
          webpackConfig: compilation.options,
          htmlWebpackPlugin: {
            files: assets,
            options: options,
          },
          process,
        };
      },
      minify: {
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeComments: true
      }
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.ProvidePlugin({
      process: 'process/browser.js',
    })
  ],
  output: {
    filename: '[name].js',
    path: path.join(__dirname, '../dist/electron')
  },
  resolve: {
    alias: {
      '@': path.join(__dirname, '../src/renderer'),
      'vue$': 'vue/dist/vue.esm-bundler.js'
    },
    extensions: ['.js', '.vue', '.json', '.css', '.node'],
    fallback: {
      process: require.resolve('process/browser.js'),
    }
  },
  target: 'electron-renderer'
}

/**
 * Adjust rendererConfig for development settings
 */
if (process.env.NODE_ENV !== 'production') {
  rendererConfig.plugins.push(
    new webpack.DefinePlugin({
      '__static': `"${path.join(__dirname, '../static').replace(/\\/g, '\\\\')}"`
    })
  )
}

/**
 * Adjust rendererConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
  rendererConfig.devtool = false

  rendererConfig.plugins.push(

    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(__dirname, '../static'),
          to: path.join(__dirname, '../dist/electron/static'),
          globOptions: {
            ignore: ['**/.*']
          }
        }
      ]
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  )
}

module.exports = rendererConfig

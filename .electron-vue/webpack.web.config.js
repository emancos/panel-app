'use strict'

process.env.BABEL_ENV = 'web'

const path = require('path')
const webpack = require('webpack')

const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const ESLintPlugin = require('eslint-webpack-plugin')

let webConfig = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  devtool: 'eval-cheap-module-source-map',
  entry: {
    web: path.join(__dirname, '../src/renderer/main.js')
  },
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
        include: [ path.resolve(__dirname, '../src/renderer') ],
        exclude: /node_modules/
      },

      {
        test: /\.(png|jpe?g|gif|svg|woff2?|eot|ttf|otf)(\?.*)?$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name]--[hash][ext]'
        }
      }
    ]
  },
  plugins: [
    new ESLintPlugin({
      extensions: ['js', 'vue'],
      formatter: require('eslint-friendly-formatter')
    }),
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({filename: 'styles.css'}),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, '../src/index.ejs'),
      minify: {
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeComments: true
      }
    }),
    new webpack.DefinePlugin({
      'process.env.IS_WEB': 'true',
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser.js',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(__dirname, '../static'),
          to: path.join(__dirname, '../dist/web/static'),
          globOptions: {
            ignore: ['**/.*']
          }
        }
      ]
    })
  ],
  output: {
    filename: '[name].js',
    path: path.join(__dirname, '../dist/web')
  },
  resolve: {
    alias: {
      '@': path.join(__dirname, '../src/renderer'),
      'vue$': 'vue/dist/vue.esm-bundler.js'
    },
    extensions: ['.js', '.vue', '.json', '.css'],
    fallback: {
      process: require.resolve('process/browser.js'),
    }
  },
  target: 'web',
  devServer: {
    static: {
      directory: path.join(__dirname, '../dist/web'),
    },
    hot: true,
    port: 9080,
  }
}

/**
 * Adjust webConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
  webConfig.devtool = false

  webConfig.plugins.push(

    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  )
}

module.exports = webConfig

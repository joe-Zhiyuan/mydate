const path = require('path');
const webpackConfig = require('./webpack.config.js');
// 合并配置
const WebpackMerge = require('webpack-merge');
// 拷贝静态资源
const CopyWebpackPlugin = require('copy-webpack-plugin');
// 压缩css
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
// 压缩js
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = WebpackMerge(webpackConfig, {
  // 自动压缩js代码,不需引入uglifyjs-webpack-plugin，但optimize-css-assets-webpack-plugin
  // 压缩css会破坏原有js压缩 所以引入uglifyjs
  mode: 'productions',
  devtool: 'cheap-module-source-map',
  plugins: [
    new CopyWebpackPlugin([{
      from: path.resolve(__dirname, '../src/public'),
      to: path.resolve(__dirname, '../dist')
    }])
  ],
  optimization: {
    minimize: [
      new UglifyJsPlugin({ // 压缩JS
        cache: true,
        parallel: true,
        sourceMap: true
      }),
      new OptimizeCssAssetsPlugin({})
    ],
    splitChunks: {
      chunks: 'all',
      cecheGroups: {
        libs: {
          name: "chunk-libs",
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          chunks: "initial" // 只打包初始时依赖的第三方
        }
      }
    }
  }
})
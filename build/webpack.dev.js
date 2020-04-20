const Webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');
// 合并配置
const WebpackMerge = require('webpack-merge');

module.exports = WebpackMerge(webpackConfig, {
  mode: 'development', // 不压缩代码，实现热更新
  devtool: 'cheap-module-eval-source-map',
  devServer: {
    port: 8080,
    hot: true,
    contentBase: '../dist'
  },
  plugins: [
    new Webpack.HotModuleReplacementPlugin(),
  ]
})
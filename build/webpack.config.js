//  webpack配置文件

const path = require('path'); // 地址
const HtmlWebpackPlugin = require('html-webpack-plugin'); // html模板
module.exports = {
  mode: 'development', // 开发模式
  entry: path.resolve(__dirname, '../src/main.js'), // 入口文件
  output: {
    filename: '[name].[hash:8].js', // 打包后文件名称 不用每次手动修改文件名
    path: path.resolve(__dirname, '../dist') // 打包后的目录
  },
  plugins:[ // html模板 自动引入js
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../public/index.html')
    })
  ]
}
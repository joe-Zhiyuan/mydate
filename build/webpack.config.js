//  webpack配置文件

const path = require('path'); // 地址
const HtmlWebpackPlugin = require('html-webpack-plugin'); // html模板
// 文件打包会残留上一次打包文件 打包前清空文件夹
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
module.exports = {
  mode: 'development', // 开发模式
  entry: { // 入口文件 多入口文件
    main: path.resolve(__dirname, '../src/main.js'),
    header: path.resolve(__dirname, '../src/header.js')
  },
  output: {
    filename: '[name].[hash:8].js', // 打包后文件名称 不用每次手动修改文件名
    path: path.resolve(__dirname, '../dist') // 打包后的目录
  },
  plugins:[ // html模板 自动引入js
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../public/index.html'),
      filename: 'index.html',
      chunks: ['main'] // 与入口文件对应的模块名
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../public/header.html'),
      filename: 'header.html',
      chunks: ['header'] //与入口对应的模块名
    }),
    new CleanWebpackPlugin(), // 打包前清空残留文件
    [require('postcss-preset-env')], // 引入postcss包处理
  ],
  module: { // 解析包
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'] // 从右向左解析原则 css-style
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', {
          loader: 'postcss-loader',
          options: {
            plugins:  [require('postcss-preset-env')]
          }
        }, 'less-loader']
      }
    ]
  }
}
//  webpack配置文件

const path = require('path'); // 地址
const HtmlWebpackPlugin = require('html-webpack-plugin'); // html模板
const postcssPresetEnv = require('postcss-preset-env'); // css预处理包
// 拆分css打包 合并为一个css文件 多个css文件 extract-text-webpack-plugin
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// 文件打包会残留上一次打包文件 打包前清空文件夹
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
module.exports = {
  mode: 'development', // 开发模式
  entry: { // 入口文件 多入口文件
    main: ['@babel/polyfill', path.resolve(__dirname, '../src/main.js')],
    header: ['@babel/polyfill', path.resolve(__dirname, '../src/header.js')]
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
    new MiniCssExtractPlugin({ // 拆分css打包 合并为一个css文件
      filename: '[name].[hash].css',
      chunkFilename: '[id].css',
      ignoreOrder: false,
    })
  ],
  module: { // 解析包
    rules: [ // 从右向左解析原则 css-style
      {
        test: /\.js$/,
        use: {
          // 将ES6/ES7转换为ES5语法，新API不会被转换(promise\Generator\Set等) 需借助@babel/polyfill转换
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: () => [
                postcssPresetEnv()
              ]
            }
          }
        ] 
      },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          'style-loader', 'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: () => [
                postcssPresetEnv()
              ]
            }
          }, 'less-loader'
        ]
      },
      {
        test: /\.(jpg?g|png|gif)$/i, // 图片文件
        use: [
          {
            loader: 'url-loader', // 限制文件大小 返回base64编码，否则用file-loader将文件移入输出目录
            options: {
              limit: 10240, // 图片大小转为base64图
              fallback: {
                loader: 'file-loader', // 对文件进行处理，主要文件名、路径、解析文件Url,并将文件移到输出目录
                options: {
                  name: 'img/[name].[hash:8].[ext]'
                }
              }
            }
          }
        ]
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/, // 媒体文件
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10240, // 图片大小转为base64图
              fallback: {
                loader: 'file-loader',
                options: {
                  name: 'media/[name].[hash:8].[ext]'
                }
              }
            }
          }
        ]
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i, // 字体文件
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10240, // 图片大小转为base64图
              fallback: {
                loader: 'file-loader',
                options: {
                  name: 'fonts/[name].[hash:8].[ext]'
                }
              }
            }
          }
        ]
      },
    ]
  }
}
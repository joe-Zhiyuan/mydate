//  webpack配置文件

const path = require('path'); // 地址
const HtmlWebpackPlugin = require('html-webpack-plugin'); // html模板
const postcssPresetEnv = require('postcss-preset-env'); // css预处理包
// 文件打包会残留上一次打包文件 打包前清空文件夹
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
// 拆分css打包 合并为一个css文件 多个css文件 extract-text-webpack-plugin
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// 解析vue文件
const vueLoaderPlugin = require('vue-loader/lib/plugin');
// webpack-dev-server 热跟新
// const Webpack = require('webpack');
// 区分开发环境与生产环境
const devMode = process.argv.indexOf('--mode=production') === -1;

module.exports = {
  // 优化打包速度 配置mode参数与devtool参数 production模式下会去除tree shaking无用代码并uglifyjs代码压缩混淆
  mode: 'development', // 模式选择 开发模式
  entry: { // 入口文件 多入口文件 转换ES6等
    main: [path.resolve(__dirname, '../src/main.js')],
    // main: ['@babel/polyfill', path.resolve(__dirname, '../src/main.js')],
    // header: ['@babel/polyfill', path.resolve(__dirname, '../src/header.js')]
  },
  output: { // 出口文件
    filename: '[name].[hash:8].js', // 打包后文件名称 不用每次手动修改文件名
    path: path.resolve(__dirname, '../dist'), // 打包后的目录
    chunkFilename: 'js/[name].[hash:8].js'
  },
  plugins:[ // 插件
    new HtmlWebpackPlugin({ // html模板 自动引入js
      template: path.resolve(__dirname, '../src/public/index.html'),
      filename: 'index.html',
      // chunks: ['main'] // 与入口文件对应的模块名
    }),
    new CleanWebpackPlugin(), // 打包前清空残留文件
    // new MiniCssExtractPlugin({ // 拆分css打包 合并为一个css文件
    //   filename: '[name].[hash].css',
    //   chunkFilename: '[id].css',
    //   ignoreOrder: false,
    // }),
    new MiniCssExtractPlugin({ // 拆分css打包 合并为一个css文件
      filename: devMode ? '[name].css' : '[name].[hash].css',
      chunkFilename: devMode ? '[id].css' : '[id].[hash].css',
      ignoreOrder: false,
    }),
    new vueLoaderPlugin(), // vue-loader 解析
    // new Webpack.HotModuleReplacementPlugin(), // webpack热跟新
  ],
  module: { // 解析包 loader 模块
    noParse: /jquery/, // 不去解析jquery中的依赖库 是否有依赖的包 jQuery不会引入其他包，加快打包速度
    rules: [ // 从右向左解析原则 css-style
      {
        test: /\.js$/,
        use: {
          // 将ES6/ES7转换为ES5语法，新API不会被转换(promise\Generator\Set等) 需借助@babel/polyfill转换
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env']
            ]
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          // MiniCssExtractPlugin.loader, // 使用MiniCssExtractPlugin压缩css,将css合并到一个css文件中，输入到指定目录 不能与style-loader一起写
          // 'style-loader', // style-loader将css-loader处理的样式注入到HTML
          {
            loader: devMode ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
            options: {
              publicPath: "../dist/css/",
              hmr: devMode
            }
          }, // 与style-loader一致
          {
            loader: 'css-loader', // css-loader加载css文件
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
          }, 'less-loader' // 将less处理为css文件
        ] 
      },
      {
        test: /\.less$/,
        use: [
          // MiniCssExtractPlugin.loader,
          // 'style-loader',
          {
            loader: devMode ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
            options: {
              publicPath: "../dist/css/",
              hmr: devMode
            }
          },
          'css-loader',
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
      {
        test: /\.vue$/,
        use: [{
          loader: 'vue-loader',
          include: [path.resolve(__dirname, 'src')], // 减少webpack loader搜索时间
          exclude: /node_modules/,
          options: {
            compilerOptions: {
              preserveWhitespace: false
            }
          }
        }]
      },
    ]
  },
  resolve: { // 路径目录
    alias: { // 别名 创建 import 或 require 的别名
      // 当出现import 'vue'时 告诉webpack去哪个路径下面找，减少搜索范围
      'vue$': 'vue/dist/vue.runtime.esm.js',
      '@': path.resolve(__dirname, '../src'),
      'assets': path.resolve(__dirname, '../src/assets'),
      'components': path.resolve(__dirname, '../src/components')
    },
    extensions: ['*', '.js', '.json', '.vue'] // 扩展名 定义后缀查找文件，频率高的优先写在前面
  },
  // devServer: { // webpack热跟新配置
  //   port: 8080,
  //   hot: true,
  //   contentBase: '../dist'
  // },
}
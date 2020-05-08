//  webpack配置文件

const path = require('path'); // 地址
const HtmlWebpackPlugin = require('html-webpack-plugin'); // html模板
const postcssPresetEnv = require('postcss-preset-env'); // css预处理包
// 文件打包会残留上一次打包文件 打包前清空文件夹
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
// 拆分css打包 合并为一个css文件 多个css文件 extract-text-webpack-plugin
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// HappyPack开启多线程loader转换 对js/css/图片等进行转换 
// 数据量大 分解到子线程并行处理，处理完发送主线程 减少总的构建时间
const HappyPack = require('happypack');
const os = require('os');
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });
// 优化代码压缩时间
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');
// 解析vue文件
const vueLoaderPlugin = require('vue-loader/lib/plugin');
// webpack-dev-server 热跟新
// const Webpack = require('webpack');
// 区分开发环境与生产环境
const devMode = process.argv.indexOf('--mode=production') === -1;
// 将打包后内容树展示为直观树状图 知道真正引入的内容  npm run dev 自动打开
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
// CDN 使用 jquery 全局直接引入 使用
// const $ = require('jquery');
// 自定义插件 打包文件大小输出 127.0.0.1:8080/filesize.md访问 文件放到node_modules中
const firstPlugin = require('webpack-firstPlugin.js');

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
    new HappyPack({
      id: 'happyBabel', // 与loader对应的id标识
      // 用法与loader配置一样 这里时loaders
      loaders: [
        {
          loader: 'babel-loader',
          options: {
            presets: [
              // 解决tree-shaking生效必须为ES6模块问题
              // 不能为commonJS 使用Babel默认转译为commonJS类型 导致tree-shaking 所以设置modules: false
              ['@babel/preset-env', {modules: false}]
            ],
            cacheDirectory: true
          }
        },
      ],
      threadPool: happyThreadPool // 共享进程池
    }),
    new ParallelUglifyPlugin({ // 优化代码压缩时间
      cacheDir: '.cache/',
      uglifyJS: {
        output: {
          comments: false,
          beautify: false
        },
        compress: {
          // drop_console: true,
          collapse_vars: true,
          reduce_vars: true
        }
      }
    }),
    new BundleAnalyzerPlugin({
      analyzerHost: '127.0.0.1',
      analyzerPort: 8081
    }),
    // 自定义打包插件
    new firstPlugin(),
  ],
  module: { // 解析包 loader 模块
    noParse: /jquery/, // 不去解析jquery中的依赖库 是否有依赖的包 jQuery不会引入其他包，加快打包速度
    rules: [ // 从右向左解析原则 css-style
      {
        test: /\.ext$/,
        use: [
          'cache-loader',
        ],
        include: path.resolve(__dirname, 'src')
      },
      {
        test: /\.js$/,
        use: {
          // 将ES6/ES7转换为ES5语法，新API不会被转换(promise\Generator\Set等) 需借助@babel/polyfill转换
          // loader: 'babel-loader',
          loader: 'happypack/loader?id=happyBabel',
          // happypack出现错误 去除options
          // HappyPack: plugin for the loader '1' could not be found! Did you forget to a
          // options: {
          //   presets: [
          //     ['@babel/preset-env']
          //   ]
          // }
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
        test: /\.(jpg|jepg|png|gif)$/i, // 图片文件
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
          options: {
            compilerOptions: {
              preserveWhitespace: false
            }
          }
        // },{
        //   loader: path.resolve('src/js/drop-console.js'),
        //   option: {}
        }],
        // 放在这里 防止出错 include表示哪些文件需要vue-loader
        // 减少webpack loader搜索时间
        include: /src/,
        // 表示哪些文件不需要vue-loader
        exclude: /node_modules/
      },
    ]
  },
  resolve: { // 路径目录
    alias: { // 别名 创建 import 或 require 的别名
      // 当出现import 'vue'时 告诉webpack去哪个路径下面找，减少搜索范围
      'vue$': 'vue/dist/vue.runtime.esm.js',
      '@': path.resolve(__dirname, '../src'),
      'assets': path.resolve(__dirname,'src/assets'),
      'components': path.resolve(__dirname,'src/components')
    },
    extensions: ['*', '.js', '.json', '.vue'] // 扩展名 定义后缀查找文件，频率高的优先写在前面
  },
  // devServer: { // webpack热跟新配置
  //   port: 8080,
  //   hot: true,
  //   contentBase: '../dist'
  // },
  // 通过CDN方式引jQuery 使用时依旧require方式 不希望webpack编译 配置Externals
  externals: {
    jquery: 'jQuery'
  }
}
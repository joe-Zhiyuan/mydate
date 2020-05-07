// 手动写一个webpack插件 打包大小
class firstPlugin{
  constructor(options){
    this.options = options
  }
  apply(compiler){
    compiler.plugin('emit', (compiler, callback) => {
      let str = ''
      for (let filename in compilation.assets) {
        str += `文件:${filename} 大小${compilation.assets[filename]['size']()}\n`
      }
      // 通过compilation.assets可以获取打包的静态资源，同样也可以写入资源
      compilation.assets['fileSize.md'] = {
        source: function () {
          return str
        },
        size: function () {
          return str.length
        }
      }
      callback()
    })
  }
}
module.exports = firstPlugin
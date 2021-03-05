const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack')

const resolve = dir => {
    return path.join(__dirname,dir);
}
//线上打包路径，
const BASE_URL = './'
const SVG_ICON_PATH = 'src/icons/svg';  // 增加svgIcon图标目录
const OUTPUT_DIR = process.env.VUE_APP_OUTPUTDIR
module.exports = {
    publicPath:BASE_URL,//publicPath取代了baseUrl
    outputDir:OUTPUT_DIR,//打包的生产环境的目录
    assetsDir:'assets',//生成的静态资源路径，默认放在outputDir (js、css、img、fonts)  (相对于 outputDir 的) 目录 
    indexPath:'./index.html',//指定生成的index.html输入路径， (相对于 outputDir)。也可以是一个绝对路径
    // page:undefined,//构建多页
    // runtimeCompiler: true, //关键点在这  原来的 Compiler 换成了 runtimeCompiler
    productionSourceMap:false,//开启生产环境的sourcemap?false提高构建速度
    /* 默认情况下，生成的静态资源在它们的文件名中包含了 hash 以便更好的控制缓存，你可以通过将这个选项设为 false 来关闭文件名哈希。(false的时候就是让原来的文件名不改变) */
    //  filenameHashing: false,
    pages: {
      index: {
      // page 的入口
     entry: 'src/main.js',
     // 模板来源
      template: 'public/index.html',
     // 在 dist/index.html 的输出
    filename: 'index.html',
   // 当使用 title 选项时，template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
 title: 'Index Page',
 
   // 在这个页面中包含的块，默认情况下会包含
     // 提取出来的通用 chunk 和 vendor chunk。
       chunks: ['chunk-vendors', 'chunk-common', 'index']
          },
           // 当使用只有入口的字符串格式时，模板会被推导为 `public/subpage.html`，并且如果找不到的话，就回退到 `public/index.html`。
          // 输出文件名会被推导为 `subpage.html`。
        //  subpage: 'src/subpage/main.js'
   },
    configureWebpack: config => {
        const env = process.env.NODE_ENV;
        
        if (env === 'production') {
          config.optimization.minimizer[0].options.terserOptions.compress.warnings = false
          config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true
          config.optimization.minimizer[0].options.terserOptions.compress.drop_debugger = true
          config.optimization.minimizer[0].options.terserOptions.compress.pure_funcs = ['console.log']
        } else {
          // 为开发环境修改配置...
          config.devtool = 'eval-source-map'
        }
        // 配置插件statr
        let plugins = [
          new HtmlWebpackPlugin({
            template: './public/index.html',
            favicon: resolve('./public/favicon.ico'),
            title: '电子协议管理系统',
            hash: true,
            minify: {
              removeAttributeQuotes: false, // 去除双引号(实际开发改为trur)
              collapseWhitespace: false, // 合并代码到一行(实际开发改为trur)
            }
          }),
          new webpack.DllReferencePlugin({
            context: process.cwd(),
            manifest: require('./public/vendor/vendor-manifest.json')
          })
        ];
        config.plugins = [...config.plugins, ...plugins];
        // 配置插件end
        performance: {
          hints:false
        }  
    },
    // webpack配置
    // see https://github.com/vuejs/vue-cli/blob/dev/docs/webpack.md
    chainWebpack:config => {
        const env = process.env.NODE_ENV;
        // 配置别名
        config.extensions = ['.js', '.vue','.json'];
        config.resolve.alias
          .set('@', path.resolve('src'))
          .set('api', path.resolve(__dirname, 'src/api'))
          .set('utils', path.resolve(__dirname, 'src/utils'))
          .set('_c', resolve('src/components'))

        const jsRule = config.module.rule('js');
        jsRule.uses.clear();
         jsRule
           .test(/\.js$/)
           .include
           .add(resolve('src'))
           .end()
           .use('babel-loader')
           .loader('babel-loader')
           .end();
           
        config.module
        .rule('images')
        .test(/\.(png|jpe?g|gif|svg|webp)(\?.*)?$/)
        .exclude
          .add(path.resolve(__dirname, SVG_ICON_PATH))
          .end();
  
          // 替换 svg 的处理
      const svgRule = config.module.rule('svg')
  
      // 清除已有的所有 loader。删除默认配置中对svg的处理
      // 如果你不这样做，接下来的 loader 会附加在该规则现有的 loader 之后。
      svgRule.uses.clear()
  
      // 添加要替换的 loader
      svgRule
        .test(/\.(svg)(\?.*)?$/)
        .include
          .add(path.resolve(__dirname, SVG_ICON_PATH))
          .end()
          .use('svg-sprite-loader')
          .loader('svg-sprite-loader')
          .options({
            symbolId: 'icon-[name]'
          })
          .end()
          .use('svgo-loader')
          .loader('svgo-loader')
          .options({
            plugins: [
              {removeTitle: true},
              {convertColors: {shorthex: false}},
              {convertPathData: false}
            ]
          });
          if(env === 'production'){
            // dllReference(config)
          }
    },
    css:{
        modules: false, // 启用 CSS modules
        // extract: true, // 是否使用css分离插件
        sourceMap: false, // 开启 CSS source maps?
        loaderOptions: {} // css预设器配置项
    },
    // 配置开发服务器
    devServer:{
        contentBase: path.join(__dirname, 'dist'),
        hot: true,//开启热更新
        host: 'localhost',
        port: 8080,
        https: true,
        // compress: true, // 自动压缩
        open: true, // 自动打开浏览器
        proxy: {
          // '/api': {
          //   target: 'http://20.223.0.37:18080/', //37
          //   // secure: false,  // 如果是https接口，需要配置这个参数
          //   changeOrigin: false, //
          //   logLevel:'debug',
          //   // pathRewrite: {
          //   //   '^/sys/': ''
          //   // }
          // },
          '/api': {
            // target: 'http://11.113.0.92:18080', //云桌面
            target: 'http://11.215.124.22:8080', //容器
            // target: 'http://20.223.0.37:18080', //37
            // secure: false,  // 如果是https接口，需要配置这个参数
            changeOrigin: false, //
            logLevel:'debug',
            pathRewrite: {
              '^/api/': ''
            }
          },
        },
        // proxy: 'https://www.easy-mock.com' // 设置代理
    },
    // 第三方插件配置
    pluginOptions: {
      // ...
    }
}

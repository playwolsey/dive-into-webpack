### 使用 Webpack Dev Middleware
在 [1-6 使用 DevServer](../1入门/1-6使用DevServer.md) 中介绍过的 DevServer 是一个方便开发的小型 HTTP 服务器，
DevServer 其实是基于 [webpack-dev-middleware](https://github.com/webpack/webpack-dev-middleware) 和 [Expressjs](https://expressjs.com) 实现的，
而 webpack-dev-middleware 其实是 Expressjs 的一个中间件。

也就是说，实现 DevServer 基本功能的代码大致如下：
```js
const express = require('express');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');

// 从 webpack.config.js 文件中读取 Webpack 配置 
const config = require('./webpack.config.js');
// 实例化一个 Expressjs app
const app = express();

// 用读取到的 Webpack 配置实例化一个 Compiler
const compiler = webpack(config);
// 给 app 注册 webpackMiddleware 中间件
app.use(webpackMiddleware(compiler));
// 启动 HTTP 服务器，监听在 3000 端口 
app.listen(3000);
```
从以上代码可以看出，从 `webpack-dev-middleware` 中导出的 `webpackMiddleware` 是一个函数，该函数需要接收一个 Compiler 实例。
在 [3-17 通过 Node.js API 启动 Webpack](3-17通过Node.jsAPI启动Webpack.md) 中曾介绍过 Webpack API 导出的 `webpack` 函数会返回一个Compiler 实例。

`webpackMiddleware` 函数的返回结果是一个 Expressjs 的中间件，该中间件有以下功能：

- 接收来自 Webpack Compiler 实例输出的文件，但不会把文件输出到硬盘，而是保存在内存中；
- 往 Expressjs app 上注册路由，拦截 HTTP 收到的请求，根据请求路径响应对应的文件内容；

通过 webpack-dev-middleware 能够将 DevServer 集成到你现有的 HTTP 服务器中，让你现有的 HTTP 服务器能返回 Webpack 构建出的内容，而不是在开发时启动多个 HTTP 服务器。
这特别适用于后端接口服务采用 Node.js 编写的项目。 

#### Webpack Dev Middleware 支持的配置项
在 Node.js 中调用 webpack-dev-middleware 提供的 API 时，还可以给它传入一些配置项，方法如下：
```js
// webpackMiddleware 函数的第二个参数为配置项
app.use(webpackMiddleware(compiler, {
    // webpack-dev-middleware 所支持的配置项
    
    // 只有 publicPath 属性为必填，其它都是选填项
    
    // Webpack 输出资源绑定在 HTTP 服务器上的根目录，
    // 和 Webpack 配置中的 publicPath 含义一致 
    publicPath: '/assets/',
        
    // 不输出 info 类型的日志到控制台，只输出 warn 和 error 类型的日志
    noInfo: false,
    
    // 不输出任何类型的日志到控制台
    quiet: false,
    
    // 切换到懒惰模式，这意味着不监听文件变化，只会在请求到时再去编译对应的文件，
    // 这适合页面非常多的项目。
    lazy: true,

    // watchOptions
    // 只在非懒惰模式下才有效
    watchOptions: {
        aggregateTimeout: 300,
        poll: true
    },
       
    // 默认的 URL 路径, 默认是 'index.html'.
    index: 'index.html',
    
    // 自定义 HTTP 头
    headers: {'X-Custom-Header': 'yes'},
    
    // 给特定文件后缀的文件添加 HTTP mimeTypes 文件类型头映射
    mimeTypes: {'text/html': ['phtml']},
    
    // 统计信息输出样式
    stats: {
        colors: true
    },
    
    // 自定义输出日志的展示方法
    reporter: null,
    
    // 开启或关闭服务端渲染
    serverSideRender: false,
}));
```

#### Webpack Dev Middleware 与模块热替换
DevServer 提供了一个方便的功能，可以做到在监听到文件发生变化时自动替换网页中的老模块，以做到实时预览。
DevServer 虽然是基于 webpack-dev-middleware 实现的，但 webpack-dev-middleware 并没有实现模块热替换功能，而是 DevServer 自己实现了该功能。

为了在使用 webpack-dev-middleware 时也能使用模块热替换功能去提升开发效率，需要额外的再接入 [webpack-hot-middleware](https://github.com/glenjamin/webpack-hot-middleware)。
需要做以下修改才能实现模块热替换。

1. 修改 `webpack.config.js` 文件，加入 `HotModuleReplacementPlugin` 插件，修改如下：
```js
const HotModuleReplacementPlugin = require('webpack/lib/HotModuleReplacementPlugin');

module.exports = {
  entry: [
    // 为了支持模块热替换，注入代理客户端
    'webpack-hot-middleware/client',
    // JS 执行入口文件
    './src/main.js'
  ],
  output: {
    // 把所有依赖的模块合并输出到一个 bundle.js 文件
    filename: 'bundle.js',
  },
  plugins: [
    // 为了支持模块热替换，生成 .hot-update.json 文件
    new HotModuleReplacementPlugin(),
  ],
  devtool: 'source-map',
};
``` 
该修改其实就是相当于完成了在 [4-6 开启模块热替换](../4优化/4-6开启模块热替换.md) 中提到的 `webpack-dev-server --hot` 的工作。

2. 修改 HTTP 服务器代码 `server.js` 文件，接入 `webpack-hot-middleware` 中间件，修改如下：
```js
const express = require('express');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');

// 从 webpack.config.js 文件中读取 Webpack 配置
const config = require('./webpack.config.js');
// 实例化一个 Expressjs app
const app = express();

// 用读取到的 Webpack 配置实例化一个 Compiler
const compiler = webpack(config);
// 给 app 注册 webpackMiddleware 中间件
app.use(webpackMiddleware(compiler));
// 为了支持模块热替换
app.use(require('webpack-hot-middleware')(compiler));
// 把项目根目录作为静态资源目录，用于服务 HTML 文件
app.use(express.static('.'));
// 启动 HTTP 服务器，监听在 3000 端口
app.listen(3000, () => {
  console.info('成功监听在 3000');
});
```

3. 修改网页执行入口文件 `main.js`，加入替换逻辑，在文件默认加入以下代码：
```js
if (module.hot) {
  module.hot.accept();
}
```

4. 安装新引入的依赖：
```bash
npm i -D webpack-dev-middleware webpack-hot-middleware express
```

安装成功后，通过 `node ./server.js` 就能启动一个类似于支持模块热替换的服务了。

> 本实例[提供项目完整代码](http://webpack.wuhaolin.cn/3-18使用WebpackDevMiddleware.zip)

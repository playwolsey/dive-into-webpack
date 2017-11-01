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

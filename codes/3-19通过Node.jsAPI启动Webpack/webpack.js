const webpack = require('webpack');
// 读取 webpack.config.js 文件中的配置
const config = require('./webpack.config');

webpack(config, (err, stats) => {
  if (err || stats.hasErrors()) {
    // 构建过程出错
  }
  // 成功执行完构建
});

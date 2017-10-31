// 通过 CommonJS 规范导入 show 函数
const show = require('./show.js');
// 执行 show 函数
show('Webpack1');

// 为了支持模块热替换
if (module.hot) {
  module.hot.accept();
}

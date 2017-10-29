### 加载 Source Map
由于在开发过程中经常会使用新语言去开发项目，最后又把源码转换成能在浏览器中直接运行的 JavaScript 代码。
这样做虽能提升开发效率，在调试代码的过程中你会发现生成的代码可读性非常差，这给代码调试带来了不便。

Webpack 支持为转换生成的代码输出对应的 Source Map 文件，以方便在浏览器中能通过源码调试。
控制 Source Map 输出的 Webpack 配置项是 `devtool`，其取值可以有很多种选项，下面来一一详细介绍。


| devtool | 含义 |
| ------- | ---- |
| 空 | 不生成 Source Map |
| eval | 每个 module 会封装到 eval 里包裹起来执行，并且会在每个 eval 语句的末尾追加注释 `//# sourceURL=webpack:///./main.js` |
| source-map | 会额外生成一个单独 Source Map 文件，并且会在 JavaScript 文件末尾追加 `//# sourceMappingURL=bundle.js.map` |
| hidden-source-map | 和 source-map 类似，但不会在 JavaScript 文件末尾追加 `//# sourceMappingURL=bundle.js.map` |
| inline-source-map | 和 source-map 类似，但不会额外生成一个单独 Source Map 文件，而是把 Source Map 转换成 base64 编码内嵌到 JavaScript 中 |
| eval-source-map | 和 eval 类似，但会把每个模块的 Source Map 转换成 base64 编码内嵌到 eval 语句的末尾，例如 `//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW...` |
| cheap-source-map | 和 source-map 类似，但生成 Source Map 文件没有列信息， |
| cheap-module-source-map | 和 cheap-source-map 类似，但会包含 Loader 生成的 Source Map |

其实以上表格只是列举了 devtool 可能取值的一部分，
它的取值其实可以由 `source-map`、`eval`、`inline`、`hidden`、`cheap`、`module` 这六个关键字随意组合而成。
这六个关键字每个都代表一种特性，它们的含义分别是：

- eval：用 `eval` 语句包裹需要安装的模块；
- source-map：生成独立的 Source Map 文件；
- hidden：不在 JavaScript 文件中指出 Source Map 文件所在，这样浏览器就不会自动加载 Source Map；
- inline：把生成的 Source Map 转换成 base64 格式内嵌在 JavaScript 文件中；
- cheap：生成的 Source Map 中不会包含列信息，这样计算量更小，输出的 Source Map 文件更小；
- module：

以上的介绍很抽象，你可能无法明白其含义，让我们来看看不同模式下的具体输出。


##### eval
以下是一个简单的模块对应的输出代码：
```js
function(module, exports) {
  eval("console.log('Hello world');\n\n//////////////////\n// WEBPACK FOOTER\n// ./app/index.js\n// module id = ./app/index.js\n// module chunks = 1\n\n//# sourceURL=webpack:///./app/index.js?")
}
```
模块的具体内容被 `eval` 包裹，代码加载后会通过执行 `eval` 语句安装模块。

##### cheap-eval-source-map
```js
function(module, exports) {
  eval("console.log('Hello world');//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9hcHAvaW5kZXguanMuanMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9hcHAvaW5kZXguanM/MGUwNCJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zb2xlLmxvZygnSGVsbG8gd29ybGQnKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2FwcC9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gLi9hcHAvaW5kZXguanNcbi8vIG1vZHVsZSBjaHVua3MgPSAxIl0sIm1hcHBpbmdzIjoiQUFBQSIsInNvdXJjZVJvb3QiOiIifQ==")
}
```
 

source-map：
```js
//# sourceMappingURL=bundle.js.map
```

bundle.js.map
```json
{
  "version": 3,
  "sources": [
    "webpack:///webpack/bootstrap 9f2430d1b6cb7a7049be",
    "webpack:///./main.js",
    "webpack:///./show.js"
  ],
  "names": [],
  "mappings": ";AAAA;AACA;;AAEA;AACA;;AAEA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;;AAEA;AACA;;AAEA;AACA;;AAEA;AACA;AACA;;;AAGA;AACA;;AAEA;AACA;;AAEA;AACA;AACA;AACA;AACA;AACA;AACA;AACA,aAAK;AACL;AACA;;AAEA;AACA;AACA;AACA,mCAA2B,0BAA0B,EAAE;AACvD,yCAAiC,eAAe;AAChD;AACA;AACA;;AAEA;AACA,8DAAsD,+DAA+D;;AAErH;AACA;;AAEA;AACA;;;;;;;AC7DA;AACA;AACA;AACA,gB;;;;;;ACHA;AACA;AACA;AACA;;AAEA;AACA",
  "file": "bundle.js",
  "sourcesContent": [
    " \t// The module cache\n \tvar installedModules = {};\n\n \t// The require function\n \tfunction __webpack_require__(moduleId) {\n\n \t\t// Check if module is in cache\n \t\tif(installedModules[moduleId]) {\n \t\t\treturn installedModules[moduleId].exports;\n \t\t}\n \t\t// Create a new module (and put it into the cache)\n \t\tvar module = installedModules[moduleId] = {\n \t\t\ti: moduleId,\n \t\t\tl: false,\n \t\t\texports: {}\n \t\t};\n\n \t\t// Execute the module function\n \t\tmodules[moduleId].call(module.exports, module, module.exports, __webpack_require__);\n\n \t\t// Flag the module as loaded\n \t\tmodule.l = true;\n\n \t\t// Return the exports of the module\n \t\treturn module.exports;\n \t}\n\n\n \t// expose the modules object (__webpack_modules__)\n \t__webpack_require__.m = modules;\n\n \t// expose the module cache\n \t__webpack_require__.c = installedModules;\n\n \t// define getter function for harmony exports\n \t__webpack_require__.d = function(exports, name, getter) {\n \t\tif(!__webpack_require__.o(exports, name)) {\n \t\t\tObject.defineProperty(exports, name, {\n \t\t\t\tconfigurable: false,\n \t\t\t\tenumerable: true,\n \t\t\t\tget: getter\n \t\t\t});\n \t\t}\n \t};\n\n \t// getDefaultExport function for compatibility with non-harmony modules\n \t__webpack_require__.n = function(module) {\n \t\tvar getter = module && module.__esModule ?\n \t\t\tfunction getDefault() { return module['default']; } :\n \t\t\tfunction getModuleExports() { return module; };\n \t\t__webpack_require__.d(getter, 'a', getter);\n \t\treturn getter;\n \t};\n\n \t// Object.prototype.hasOwnProperty.call\n \t__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };\n\n \t// __webpack_public_path__\n \t__webpack_require__.p = \"\";\n\n \t// Load entry module and return exports\n \treturn __webpack_require__(__webpack_require__.s = 0);\n\n\n\n// WEBPACK FOOTER //\n// webpack/bootstrap 9f2430d1b6cb7a7049be",
    "// 通过 CommonJS 规范导入 show 函数\nconst show = require('./show.js');\n// 执行 show 函数\nshow('Webpack');\n\n\n//////////////////\n// WEBPACK FOOTER\n// ./main.js\n// module id = 0\n// module chunks = 0",
    "// 操作 DOM 元素，把 content 显示到网页上\nfunction show(content) {\n  window.document.getElementById('app').innerText = 'Hello,' + content;\n}\n\n// 通过 CommonJS 规范导出 show 函数\nmodule.exports = show;\n\n\n\n//////////////////\n// WEBPACK FOOTER\n// ./show.js\n// module id = 1\n// module chunks = 0"
  ],
  "sourceRoot": ""
}
```

#### Devtool 的区别
一个简单的 Devtool 配置项，提供了这么多选项，但很多人搞不清楚它们之间的差别和应用场景。

如果你不关心细节和性能，只是想方便调试源码，可以直接设置成 `source-map`，但这样会造成两个问题：

- `source-map` 模式下会输出质量最高最详细的 Source Map，这会造成构建速度缓慢，特别是在开发过程需要频繁修改的时候会增加等待时间；
- `source-map` 模式下会把 Source Map 暴露出去，如果构建发布到线上的代码的 Source Map 暴露出去就等于源码被泄露；

为了  

@TODO https://juejin.im/post/58293502a0bb9f005767ba2f

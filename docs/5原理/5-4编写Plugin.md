### 编写 Plugin
Webpack 通过 Plugin 机制让其更加灵活，以适应各种应用场景。
在 Webpack 运行的生命周期中会广播出许多事件，Plugin 可以监听这些事件，在合适的时机通过 Webpack 提供的 API 改变输出结果。

一个最基础的 Plugin 的代码是这样的：
```js
class BasicPlugin{
  // 在构造函数中获取用户给该插件传入的配置
  constructor(options){
  }
  
  // Webpack 会调用 BasicPlugin 实例的 apply 方法给插件实例传入 compiler 对象
  apply(compiler){
    compiler.plugin('compilation',function(compilation) {
    })
  }
}

// 导出 Plugin
module.exports = BasicPlugin;
```

在使用这个 Plugin 时，相关配置代码如下：
```js
const BasicPlugin = require('./BasicPlugin.js');
module.export = {
  plugins:[
    new BasicPlugin(options),
  ]
}
```

Webpack 启动后，在读取配置的过程中会先执行 `new BasicPlugin(options)` 初始化一个 BasicPlugin 获得其实例。
在初始化 compiler 对象后，再调用 `basicPlugin.apply(compiler)` 给插件实例传入 compiler 对象。
插件实例在获取到 compiler 对象后，就可以通过 `compiler.plugin(事件名称, 回掉函数)` 监听到 Webpack 广播出来的事件。
并且可以通过 compiler 对象去操作 Webpack。

通过以上最简单的 Plugin 相信你大概明白了 Plugin 的工作原理，但实际开发中还有很多细节需要注意，下面来详细介绍。

#### Compiler 和 Compilation
在开发 Plugin 时最常用的两个对象就是 Compiler 和 Compilation，它们是 Plugin 和 Webpack 之间的桥梁。
Compiler 和 Compilation 的含义如下：

- Compiler 对象包涵了 Webpack 环境所有的的配置信息，包含 options，loaders，plugins 这些信息，这个对象在 Webpack 启动时候被构建，它是全局唯一的，可以简单地把它理解为 Webpack 实例；
- Compilation 对象包含了当前的模块资源、编译生成资源、变化的文件等。当 Webpack 以开发模式运行时，每当检测到一个文件变化，一次新的 Compilation 将被创建。Compilation 对象也提供了很多事件点回调供插件做扩展。通过 Compilation 也能读取到 Compiler 对象。

Compiler 和 Compilation 的区别在于：Compiler 代表了整个 Webpack 从启动到关闭的生命周期，而 Compilation 只是代表了一次新的编译。   


#### 事件流
Webpack 就像一条生产线，要尽量一系列处理流程后才能将源文件转换成输出结果。
这条生产线上的每个处理流程的职责都是单一的，多个流程之间有存在依赖关系，只有完成当前处理后才能交给下一个流程去处理。
插件就像是一个插入到生成线中的一个功能，在特定的步骤对生产线上的资源做处理。

Webpack 通过 [Tapable](https://github.com/webpack/tapable) 来组织这条复杂的生产线。
Webpack 在运行过程中会广播事件，插件只需要监听它所关系的事件，就能加入到这条生产线中。
Webpack 的事件流机制保证了插件的有序性，使得整个系统非常有弹性，扩展性很好。

Webpack 的事件流机制应用了观察者模式，和 Node.js 中的 EventEmitter 非常相似。
Compiler 和 Compilation 都继承自 Tapable，可以直接在 Compiler 和 Compilation 对象上广播和监听事件，方法如下：
```js
/**
* 广播出事件
* event-name 为事件名称，注意不要和现有的事件重名
* params 为附带的参数
*/
compiler.apply('event-name',params);

/**
* 监听名称为 event-name 的事件，当 event-name 事件发生时，函数就会被执行。
* 同时函数中的 params 参数为广播事件时附带的参数。
*/
compiler.plugin('event-name',function(params) {
  
});

// 同理，compilation.apply 和 compilation.plugin 使用方法和上面一致。 
```

在开发插件时，你可能会不知道该如何下手，因为你不知道该监听哪个事件才能完成任务。
在[5-1工作原理概括](5-1工作原理概括.md)中详细介绍过 Webpack 在运行过程中广播出常用事件，你可以从中找到你需要的事件。

在开发插件时，还需要注意以下两点：
- 只要能拿到 Compiler 或 Compilation 对象，就能广播出新的事件，所以在新开发的插件中也能广播出事件，给其它插件监听使用。
- 传给每个插件的 Compiler 和 Compilation 对象都是同一个引用。也就是说在一个插件中修改了 Compiler 或 Compilation 对象上的属性，会影响到后面的插件。


#### 常用 API
在开发插件时经常会需要通过调用 Webpack 提供的 API 才能完成一些功能，接下来介绍一些常用的 API。

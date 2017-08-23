'use strict';
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ghpages = require('gh-pages');
const { name } = require('./package.json');

/********************************* 在线读者 ***********************************/

// 生成网页
execSync(`node ./node_modules/gitbook-cli/bin/gitbook.js build`);

// 生成电子书
// execSync(`node ./node_modules/gitbook-cli/bin/gitbook.js pdf ./ _book/${name}.pdf`); // 生产 pdf
// execSync(`node ./node_modules/gitbook-cli/bin/gitbook.js epub ./ _book/${name}.epub`); // 生产 epub
// execSync(`node ./node_modules/gitbook-cli/bin/gitbook.js mobi ./ _book/${name}.mobi`); // 生产 mobi

// 打包代码 zip
execSync(`git archive --format=zip HEAD:codes -o _book/${name}.zip`);
console.log('打包代码 zip');

/********************************* 纸质读者 ***********************************/

// 合并 markdown 为一个文件
const entryPath = path.resolve(__dirname, 'docs/README.md');
const entryDir = path.dirname(entryPath);
let str = fs.readFileSync(entryPath, {
  encoding: 'utf8',
});
let oneMd = str + '\n';
str.replace(/\[.+]\((.+\.md)\)/g, (_, mdPath) => {
  mdPath = path.resolve(entryDir, mdPath);
  if (fs.existsSync(mdPath)) {
    let mdDir = path.dirname(mdPath);
    let content = fs.readFileSync(mdPath, {
      encoding: 'utf8',
    });
    // 提取出外链
    content = content.replace(/\[(.+)]\((https?:\/\/.+)\)/g, '$1($2)');
    // 修正内链
    content = content.replace(/\[(.+)]\(((?!https?:\/\/).+)\)/g, (match, p1, p2) => {
      p2 = path.resolve(mdDir, p2);
      if (p2.match(/.+.md.*/)) {
        return p1;
      }
      return `[${p1}](${p2})`;
    });
    oneMd += content + '\n';
  }
});
fs.writeFileSync(`_book/${name}.md`, oneMd);
console.log('生成完整 markdown');

// 生成 docx
execSync(`pandoc --standalone --data-dir docs --output _book/${name}.docx --from markdown --to docx _book/${name}.md`);
console.log('生成完整 docx');

/********************************* 发布到 gh-pages ***********************************/
fs.writeFileSync(path.resolve('_book', 'CNAME'), 'webpack.wuhaolin.cn');
ghpages.publish('_book', function (err) {
  if (err) {
    console.error('发布到 gh-pages 失败，错误：', err);
  } else {
    console.info('发布到 gh-pages 成功');
  }
});

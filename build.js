'use strict';
const {execSync} = require('child_process');
const {readFileSync, readdirSync, writeFileSync, existsSync} = require('fs');
const {resolve, join, dirname} = require('path');
const {name} = require('./package.json');

const docsDir = resolve(__dirname, './docs/');
const summaryPath = resolve(docsDir, 'SUMMARY.md');

/**
 * 读取文本文件
 * @param filePath
 */
function readTextFile(filePath) {
  return readFileSync(filePath, {
    encoding: 'utf8',
  });
}

/**
 * 读取 docs 目录下的每一个文件
 * @param each 迭代函数(mdPath, mdContent)
 */
function iterateDocs(each) {
  const summaryContent = readTextFile(summaryPath);
  summaryContent.replace(/\[.+]\((.+\.md)\)/g, (_, mdLink) => {
    const mdPath = resolve(docsDir, mdLink);
    if (existsSync(mdPath)) {
      const mdContent = readTextFile(mdPath);
      each(mdPath, mdContent);
    }
  });
}

/********************************* 在线读者 ***********************************/

// 生成网页
execSync(`gitbook build`);
console.log('生成网页静态文件成功');

// zip所有项目代码
const codesDir = 'codes';
// zip单个项目代码
readdirSync(codesDir).forEach(fileName => {
  execSync(`git archive --format=zip HEAD:${join(codesDir, fileName)} -o _book/${fileName}.zip`);
  console.log(`zip ${fileName} 项目代码`);
});

// 自定义域名
writeFileSync(resolve('_book', 'CNAME'), 'webpack.wuhaolin.cn');

/********************************* 纸质读者 ***********************************/

// 合并 markdown 为一个文件
let mdAllInOne = '';
iterateDocs((mdPath, mdContent) => {
  const mdDir = dirname(mdPath);

  // 提取出外链，链接用斜体
  mdContent = mdContent.replace(/\[(.+)]\((https?:\/\/.+)\)/g, '*$1($2)*');

  // 修正内链
  mdContent = mdContent.replace(/\[(.+)]\(((?!https?:\/\/).+)\)/g, (match, p1, p2) => {
    p2 = resolve(mdDir, p2);
    if (p2.match(/.+.md.*/)) {
      // 链接用斜体
      return `*${p1}*`;
    }
    return `[${p1}](${p2})`;
  });
  mdAllInOne += mdContent + '\n';
});

writeFileSync(`_book/${name}.md`, mdAllInOne);
console.log('拼接完整 markdown');

// 生成 docx
execSync(`pandoc --reference-doc template.docx --no-highlight --data-dir docs --output _book/${name}.docx --from markdown --to docx _book/${name}.md`);
console.log('生成完整 docx');

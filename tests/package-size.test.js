/** node tests/package-size.test.js — 主包（miniprogram/ 去掉 packOptions.ignore 的部分）必须 < 2MB，且不含设计源文件 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '../miniprogram');
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const all = walk(root).filter((f) => !/\.md$/.test(f));
const isSub = (f) => path.relative(root, f).startsWith('subpkg' + path.sep);
const files = all.filter((f) => !isSub(f)); // 主包 = miniprogram/ 去掉 subpkg/（源码字节，未编译未压缩）
const total = files.reduce((s, f) => s + fs.statSync(f).size, 0);
const subFiles = all.filter(isSub);
const subTotal = subFiles.reduce((s, f) => s + fs.statSync(f).size, 0);
assert.ok(subTotal < 2 * 1024 * 1024, `subpkg ${subTotal} bytes`);
assert.ok(!files.some((f) => /\.webp$/.test(f)), 'webp must stay in subpackage');
assert.ok(total < 2 * 1024 * 1024, `main package ${total} bytes`);
files.forEach((f) => assert.ok(!/(-1024|-512)\.png$|\.jpg$|previews|draft/.test(f), `design asset in package: ${path.relative(root, f)}`));
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, '../project.config.json'), 'utf8'));
assert.ok(cfg.packOptions.ignore.length > 0);
assert.ok(fs.existsSync(path.join(__dirname, '..', cfg.appIconPath)), 'appIconPath exists');
console.log(`package-size tests passed (main ${total} bytes, subpkg ${subTotal} bytes)`);

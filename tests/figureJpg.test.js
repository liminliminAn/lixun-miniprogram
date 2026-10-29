/** node tests/figureJpg.test.js — 真机 P0：图解改为基线 JPEG（去掉 webp 解码变量）；静态清单校验，不依赖运行时文件检查 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '../miniprogram');
const sub = path.join(root, 'subpkg/exercises');
const files = fs.readdirSync(sub).filter((f) => /\.\w+$/.test(f));
assert.ok(!files.some((f) => /\.webp$/i.test(f)), 'no webp left in subpackage');
const jpgs = files.filter((f) => f.endsWith('.jpg'));
assert.strictEqual(jpgs.length, 62, `jpg count ${jpgs.length}`);
jpgs.forEach((f) => {
  assert.ok(/^[a-z0-9_]+\.jpg$/.test(f), `lowercase ascii filename ${f}`);
  const b = fs.readFileSync(path.join(sub, f));
  assert.ok(b[0] === 0xff && b[1] === 0xd8, `real JPEG ${f}`);
});
// 配置里引用的每张图都在静态清单（磁盘文件名完全一致，区分大小写）
const refs = new Set();
['exercise-cards.js', 'warmup.js', 'posture.js'].forEach((c) => {
  const s = fs.readFileSync(path.join(root, 'config', c), 'utf8');
  (s.match(/\/subpkg\/exercises\/[^"']+/g) || []).forEach((p) => refs.add(p));
});
assert.ok(refs.size > 0);
refs.forEach((p) => { assert.ok(p.endsWith('.jpg'), p); assert.ok(jpgs.includes(p.split('/').pop()), `missing ${p}`); });
// packOptions.ignore 不能把分包图片排除出上传包
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, '../project.config.json'), 'utf8'));
cfg.packOptions.ignore.forEach((r) => {
  const v = String(r.value);
  assert.ok(!(r.type === 'suffix' && /jpg|webp/.test(v)), `suffix ignore ${v}`);
  assert.ok(!/subpkg/.test(v), `ignore touches subpkg: ${v}`);
  if (r.type === 'glob') assert.ok(!/^\*\*\/\*\.jpg$/.test(v), `global jpg ignore ${v}`);
});
// 分包页不得用 FileSystemManager/getFileInfo 判断代码包内文件（真机不可靠）
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
walk(root).filter((f) => /\.(ts|js)$/.test(f) && !/services[\\/]user\.ts$/.test(f)).forEach((f) => {
  const s = fs.readFileSync(f, 'utf8');
  assert.ok(!/accessSync|getFileInfo|getFileSystemManager/.test(s), `runtime file check in ${path.relative(root, f)}`);
});
console.log(`figureJpg OK (${jpgs.length} jpg, ${refs.size} refs)`);
// P3-2：路径白名单拒绝 .webp
{
  const W = require('./lib/warmup');
  const { subpkgImage } = require('./lib/exerciseCards');
  [W.subpkgFigure, subpkgImage].forEach((fn) => {
    assert.strictEqual(fn('/subpkg/exercises/bench_press.webp'), '');
    assert.strictEqual(fn('/subpkg/exercises/bench_press.jpg'), '/subpkg/exercises/bench_press.jpg');
  });
  ['utils/warmup.ts', 'utils/exerciseCards.ts'].forEach((f) => assert.ok(!/webp\|/.test(fs.readFileSync(path.join(root, f), 'utf8')), f));
  console.log('webp rejected OK');
}

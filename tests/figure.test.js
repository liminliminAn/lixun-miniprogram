/** node tests/figure.test.js — 热身/体态图解：主包不渲染图片，只给「查看图解 ›」入口，分包图解页显示真图（binderror 隐藏、24rpx 圆角）；只依赖文件名 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '../miniprogram');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const W = require('./lib/warmup');
const { buildPostureView } = require('./lib/posture');
const wcfg = require(path.join(root, 'config/warmup.js'));
const pcfg = require(path.join(root, 'config/posture.js'));
const exists = (p) => fs.existsSync(path.join(root, p));

assert.strictEqual(W.subpkgFigure('/subpkg/exercises/a.webp'), '/subpkg/exercises/a.webp');
['/assets/a.png', null, '', 'subpkg/a.webp', 3].forEach((x) => assert.strictEqual(W.subpkgFigure(x), ''));
assert.strictEqual(W.figureUrl(W.WARMUP_FIGURE_PAGE, '/subpkg/exercises/a.webp', '标 题', 'c&d'),
  '/subpkg/exercises/warmup-figure/warmup-figure?img=%2Fsubpkg%2Fexercises%2Fa.webp&title=%E6%A0%87%20%E9%A2%98&cue=c%26d');
assert.strictEqual(W.mainPkgImage, undefined, 'mainPkgImage removed');

// 热身：每个有 /subpkg/ 图的条目都有 figure，且文件存在；无图则无入口
let wn = 0;
['push', 'pull', 'legs'].forEach((d) => W.buildWarmupSections(wcfg, d).forEach((sec) => sec.items.forEach((i) => {
  if (i.figure) { wn++; assert.ok(exists(i.figure), `missing ${i.figure}`); }
})));
assert.ok(wn > 0, 'warmup figures');
// 体态：drills/pre 与 selfcheck_ 自查图
const pv = buildPostureView(pcfg);
let pn = 0, sn = 0;
pv.issues.forEach((it) => {
  [...it.pre, ...it.drills].forEach((d) => { if (d.figure) { pn++; assert.ok(exists(d.figure), d.figure); } });
  if (it.selfCheckFigure) { sn++; assert.ok(/\/selfcheck_[a-z_]+\.jpg$/.test(it.selfCheckFigure) && exists(it.selfCheckFigure)); }
});
assert.ok(pn > 0 && sn > 0, `posture figures ${pn}/${sn}`);
// 配置里的每个 image 都在分包且文件存在
const imgs = [];
const walk = (v) => { if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') Object.keys(v).forEach((k) => (k === 'image' && typeof v[k] === 'string' ? imgs.push(v[k]) : walk(v[k]))); };
walk(wcfg); walk(pcfg);
imgs.forEach((p) => assert.ok(p.indexOf('/subpkg/exercises/') === 0 && exists(p), p));

// 主包页面：无 <image>，入口条件为 figure，文案「查看图解 ›」
[['pages/warmup/warmup', 'item.figure'], ['pages/posture/posture', 'd.figure']].forEach(([pg, cond]) => {
  const wx = read(pg + '.wxml');
  assert.ok(!/<image/.test(wx) && !/\/subpkg\//.test(wx), pg);
  assert.ok(wx.includes(`wx:if="{{${cond}}}"`) && wx.includes('查看图解 ›') && wx.includes('onOpenFigure'), pg);
  assert.ok(/onOpenFigure[\s\S]*navigateTo[\s\S]*figureUrl/.test(read(pg + '.ts')), pg);
});
assert.ok(read('pages/posture/posture.wxml').includes('it.selfCheckFigure'));

// 分包图解页：真图 + binderror 隐藏 + 24rpx
const app = JSON.parse(read('app.json'));
['warmup-figure/warmup-figure', 'posture-figure/posture-figure'].forEach((pg) => {
  assert.ok(app.subPackages[0].pages.includes(pg), pg);
  const b = 'subpkg/exercises/' + pg;
  ['.ts', '.wxml', '.wxss', '.json'].forEach((e) => assert.ok(exists(b + e), b + e));
  assert.ok(/<image[^>]*wx:if="\{\{showImg\}\}"[^>]*binderror="onImgError"/.test(read(b + '.wxml')));
  assert.ok(/onImgError\(e: any\)\s*\{[\s\S]*?onFigureError\(/.test(read(b + '.ts'))); // 真机 P0：warn + 文字兜底
  assert.ok(/subpkgFigure/.test(read(b + '.ts')));
  assert.ok(/\.img\s*\{[^}]*border-radius:\s*24rpx/.test(read(b + '.wxss')));
});
console.log(`figure tests passed (warmup ${wn}, posture ${pn}, selfcheck ${sn})`);
// P3：任何 <image> 只要可能显示 webp（分包内全部页面 / src 含 .webp）必须 webp="{{true}}"
{
  const wk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? wk(path.join(d, e.name)) : [path.join(d, e.name)]);
  let n = 0;
  wk(root).filter((f) => f.endsWith('.wxml')).forEach((f) => {
    const rel = path.relative(root, f);
    (fs.readFileSync(f, 'utf8').match(/<image\b[^>]*>/g) || []).forEach((tag) => {
      if (rel.startsWith('subpkg') || /\.webp/.test(tag)) { n++; assert.ok(/\bwebp="\{\{true\}\}"/.test(tag), `missing webp="{{true}}" in ${rel}: ${tag}`); }
    });
  });
  assert.ok(n >= 3, `webp images checked ${n}`);
  assert.ok(!/\bwebp="\{\{true\}\}"/.test('<image src="a.webp" />'));
}
console.log('webp attr tests passed');
// P3：路径白名单 + 全空提示
{
  const { subpkgImage } = require('./lib/exerciseCards');
  [W.subpkgFigure, subpkgImage].forEach((fn) => {
    ['/subpkg/exercises/a.webp', '/subpkg/exercises/a.png', '/subpkg/exercises/a.jpg'].forEach((ok) => assert.strictEqual(fn(ok), ok));
    ['subpkg/exercises/a.webp', '/assets/a.webp', '/subpkg/exercises/a.gif', '/subpkg/exercises/a.jpeg', '/subpkg/exercises/a.svg',
      '/subpkg/../assets/a.webp', '/subpkg/exercises/..a.webp', 'https://x/subpkg/a.webp', '/subpkg/exercises/a.webp?x', '', null, 1]
      .forEach((bad) => assert.strictEqual(fn(bad), '', String(bad)));
  });
  assert.strictEqual(W.FIGURE_EMPTY_HINT, '没有可显示的图解内容');
  ['detail/detail', 'warmup-figure/warmup-figure', 'posture-figure/posture-figure'].forEach((pg) => {
    const b = 'subpkg/exercises/' + pg, wx = read(b + '.wxml'), ts = read(b + '.ts');
    assert.ok(/wx:if="\{\{empty\}\}"[\s\S]*没有可显示的图解内容[\s\S]*bindtap="onBack"[^>]*>返回/.test(wx), pg);
    assert.ok(/onBack\(\)\s*\{\s*if \(getCurrentPages\(\)\.length > 1\) wx\.navigateBack\(\);\s*else wx\.switchTab\(\{ url: '\/pages\/today\/today' \}\);/.test(ts) && /empty: (true|!img && !title && !cue)/.test(ts), pg);
  });
  ['warmup-figure', 'posture-figure'].forEach((n) => assert.ok(/showImg: !!img/.test(read(`subpkg/exercises/${n}/${n}.ts`)) && /subpkgFigure\(/.test(read(`subpkg/exercises/${n}/${n}.ts`))));
  assert.ok(!/navigateBack\(\);\s*return/.test(read('subpkg/exercises/detail/detail.ts')));
  console.log('figure guard tests passed');
}
// P3-1：onBack 行为（模拟页面栈）
['detail/detail', 'warmup-figure/warmup-figure', 'posture-figure/posture-figure'].forEach((pg) => {
  const body = read('subpkg/exercises/' + pg + '.ts').match(/onBack\(\)\s*\{([\s\S]*?)\n  \},/)[1];
  [[2, 'navigateBack'], [1, 'switchTab:/pages/today/today']].forEach(([n, want]) => {
    const calls = [];
    const wx = { navigateBack: () => calls.push('navigateBack'), switchTab: (o) => calls.push('switchTab:' + o.url) };
    new Function('wx', 'getCurrentPages', body)(wx, () => new Array(n));
    assert.deepStrictEqual(calls, [want], `${pg} stack=${n}`);
  });
});
console.log('figure back tests passed');

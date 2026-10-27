/** node tests/posture.test.js — tests/lib/posture.js 由 miniprogram/utils/posture.ts 经 tsc 生成 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { buildPostureView, TAN_AUTHOR, shoulderWarmupAddon } = require('./lib/posture');
const cfg = require('../miniprogram/config/posture.js');

const v = buildPostureView(cfg);
assert.ok(v.disclaimer.includes('非医疗建议'));
assert.strictEqual(v.issues[0].id, 'shoulder_impingement'); // priority 排序
v.issues.forEach((it) => {
  assert.ok(it.precheck.length > 0); // precheck 总显示
  assert.strictEqual(it.showSelfCheck, false); // selfCheck=null 隐藏
  assert.strictEqual(it.frequency, '参考量待定');
  [...it.pre, ...it.drills].forEach((d) => assert.strictEqual(d.dose, '参考量待定'));
});
const tan = v.issues.find((i) => i.id === 'shoulder_impingement');
assert.strictEqual(tan.author, TAN_AUTHOR);
assert.ok(tan.sourceUrl.startsWith('https://') && tan.sourceText.includes('ep.21'));
assert.strictEqual(tan.drills[1].cue, ''); // 「待核实」cue 不显示
v.issues.filter((i) => i.id !== 'shoulder_impingement').forEach((i) => {
  assert.strictEqual(i.author, '');
  assert.strictEqual(i.sourceText, '');
  assert.ok(!JSON.stringify(i).includes(TAN_AUTHOR)); // generic 无作者
});
// 带来源但 attribution=generic → 不展示来源
const g = buildPostureView({ issues: [{ id: 'x', title: 't', attribution: 'generic', source: { title: 'a', url: 'https://x' }, selfCheck: '站墙' }] });
assert.deepStrictEqual([g.issues[0].sourceUrl, g.issues[0].author, g.issues[0].showSelfCheck], ['', '', true]);

// 热身附加：仅推/拉日，仅 tan 肩部条目，可选，dose 占位
['push', 'pull'].forEach((d) => {
  const a = shoulderWarmupAddon(cfg, d);
  assert.strictEqual(a.optional, true);
  assert.deepStrictEqual(a.items.map((i) => i.text), ['训练前放松小圆肌', '跪姿死虫', '弹力带肩胛后倾']);
  a.items.forEach((i) => { assert.strictEqual(i.dose, '参考量待定'); assert.ok(i.source.title.startsWith(TAN_AUTHOR)); });
});
assert.strictEqual(shoulderWarmupAddon(cfg, 'legs'), null);
assert.strictEqual(shoulderWarmupAddon({ issues: [{ id: 'shoulder_x', attribution: 'generic', drills: [{ name: 'a' }] }] }, 'push'), null);

// UI 全量扫描：任何页面/组件/配置都不能出现「谭成义教法」；
// 「谭成义」只允许出现在 posture 归因代码与 posture.json（且展示层只对 attribution=tan 输出，见上）
const root = path.join(__dirname, '../miniprogram');
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? (e.name === 'assets' ? [] : walk(path.join(d, e.name))) : [path.join(d, e.name)]);
const allowTan = new Set(['utils/posture.ts', 'config/posture.js']);
walk(root).filter((f) => /\.(wxml|ts|json|wxss|js)$/.test(f)).forEach((f) => {
  const txt = fs.readFileSync(f, 'utf8');
  const rel = path.relative(root, f);
  assert.ok(!txt.includes('谭成义教法'), `谭成义教法 in ${rel}`);
  if (!allowTan.has(rel)) assert.ok(!txt.includes('谭成义'), `谭成义 in ${rel}`);
});
console.log('posture tests passed');

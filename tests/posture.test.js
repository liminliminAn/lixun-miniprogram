/** node tests/posture.test.js — tests/lib/posture.js 由 miniprogram/utils/posture.ts 同步 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {
  buildPostureView, TAN_AUTHOR, shoulderWarmupAddon, SOURCE_LABEL, COPY_TOAST,
  MEDICAL_TIP_TITLE, SHORT_DISCLAIMER, splitDisclaimer,
} = require('./lib/posture');
const cfg = require('../miniprogram/config/posture.js');

const v = buildPostureView(cfg);
assert.ok(v.disclaimer.includes('非医疗建议'));
assert.strictEqual(v.shortDisclaimer, SHORT_DISCLAIMER);
assert.strictEqual(v.medicalTipTitle, MEDICAL_TIP_TITLE);
assert.ok(v.medicalTip.includes('麻木'));
assert.ok(v.medicalTip.includes('放射痛'));
assert.ok(v.medicalTip.includes('夜间痛'));
assert.ok(v.medicalTip.includes('外伤后疼痛'));
assert.ok(v.medicalTip.includes('持续 2 周不缓解'));
assert.ok(v.medicalTip.includes('就医'));
assert.strictEqual(v.issues[0].id, 'shoulder_impingement'); // priority 排序
v.issues.forEach((it) => {
  assert.ok(it.precheck.length > 0); // precheck 总显示
  assert.strictEqual(it.showSelfCheck, false); // selfCheck=null 隐藏
  assert.strictEqual(it.frequency, '参考量待定');
  [...it.pre, ...it.drills].forEach((d) => assert.strictEqual(d.dose, '参考量待定'));
});
const tan = v.issues.find((i) => i.id === 'shoulder_impingement');
// 永不署名；有来源一律「参考来源 · title」
assert.strictEqual(tan.author, '');
assert.strictEqual(tan.sourceText, `${SOURCE_LABEL} · ep.21`);
assert.ok(tan.sourceUrl.startsWith('https://'));
assert.ok(!JSON.stringify(v).includes(TAN_AUTHOR));
// 即使 verified===true 的 tan 条目也不署名，仍用「参考来源」
const ver = buildPostureView({ issues: [{ id: 'shoulder_v', title: 't', attribution: 'tan', verified: true, source: { title: 'ep.1', url: 'https://x' }, selfCheck: null }] });
assert.deepStrictEqual([ver.issues[0].author, ver.issues[0].sourceText], ['', `${SOURCE_LABEL} · ep.1`]);
// generic 即使 verified 也不署名
assert.strictEqual(buildPostureView({ issues: [{ id: 'g', attribution: 'generic', verified: true, source: { title: 'a', url: 'https://x' } }] }).issues[0].author, '');
assert.strictEqual(COPY_TOAST, '链接已复制，请到浏览器打开');
assert.strictEqual(tan.drills[1].cue, ''); // 「待核实」cue 不显示
v.issues.filter((i) => i.id !== 'shoulder_impingement').forEach((i) => {
  assert.strictEqual(i.author, '');
  assert.strictEqual(i.sourceText, '');
  assert.ok(!JSON.stringify(i).includes(TAN_AUTHOR)); // generic 无作者
});
// 带来源但 attribution=generic → 不展示来源
const g = buildPostureView({ issues: [{ id: 'x', title: 't', attribution: 'generic', source: { title: 'a', url: 'https://x' }, selfCheck: '站墙' }] });
assert.deepStrictEqual([g.issues[0].sourceUrl, g.issues[0].author, g.issues[0].showSelfCheck], ['', '', true]);

// 热身附加：仅推/拉日，仅 tan 肩部条目，可选，dose 占位；来源标签永不为作者名
['push', 'pull'].forEach((d) => {
  const a = shoulderWarmupAddon(cfg, d);
  assert.strictEqual(a.optional, true);
  assert.deepStrictEqual(a.items.map((i) => i.text), ['训练前放松小圆肌', '跪姿死虫', '弹力带肩胛后倾']);
  a.items.forEach((i) => { assert.strictEqual(i.dose, '参考量待定'); assert.ok(i.source.title.startsWith(SOURCE_LABEL) && !i.source.title.includes(TAN_AUTHOR)); });
});
assert.strictEqual(shoulderWarmupAddon(cfg, 'legs'), null);
assert.strictEqual(shoulderWarmupAddon({ issues: [{ id: 'shoulder_x', attribution: 'generic', drills: [{ name: 'a' }] }] }, 'push'), null);

// splitDisclaimer
const sp = splitDisclaimer('非医疗建议。出现麻木、放射痛，请就医。');
assert.strictEqual(sp.shortDisclaimer, '非医疗建议。');
assert.ok(sp.medicalTip.startsWith('出现麻木'));

// 页面：就医提示默认可折叠区块（expanded by default）
const pageTs = fs.readFileSync(path.join(__dirname, '../miniprogram/pages/posture/posture.ts'), 'utf8');
const pageWxml = fs.readFileSync(path.join(__dirname, '../miniprogram/pages/posture/posture.wxml'), 'utf8');
assert.ok(pageTs.includes('medicalOpen: true'));
assert.ok(pageTs.includes('onToggleMedical'));
assert.ok(pageWxml.includes('就医提示') || pageWxml.includes('medicalTipTitle'));
assert.ok(pageWxml.includes('medicalOpen'));
assert.ok(pageWxml.includes('shortDisclaimer'));

// UI 全量扫描：任何页面/组件/配置都不能出现「谭成义教法」；
// 「谭成义」只允许出现在 posture 归因代码与 posture 配置（展示层永不输出人名）
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
// 复制链接均带 toast；页面样式无硬编码白色
['pages/posture/posture.ts', 'pages/warmup/warmup.ts'].forEach((f) => {
  const t = fs.readFileSync(path.join(root, f), 'utf8');
  assert.ok(t.includes('setClipboardData') && t.includes('COPY_TOAST'), f);
});
walk(root).filter((f) => f.endsWith('.wxss') && !f.endsWith('app.wxss')).forEach((f) =>
  assert.ok(!/#fff(fff)?\b|\bwhite\b/i.test(fs.readFileSync(f, 'utf8')), `hardcoded white in ${path.relative(root, f)}`));
console.log('posture tests passed');

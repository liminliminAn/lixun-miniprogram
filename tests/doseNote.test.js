/** node tests/doseNote.test.js — 全站剂量说明只允许唯一文案「剂量为通用建议，因人而异」 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const NOTE = '剂量为通用建议，因人而异';
const root = path.join(__dirname, '../miniprogram');
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? (e.name === 'assets' ? [] : walk(path.join(d, e.name))) : [path.join(d, e.name)]);
// 只检剂量说明变体（sourceNote 等内部注记里的「通用康复建议」不是剂量说明）
const VARIANT = /通用(康复)?建议，因人而异|剂量为通用(康复)?建议|因人而异/;
let hits = 0;
walk(root).filter((f) => /\.(wxml|ts|js|json)$/.test(f)).forEach((f) => {
  const raw = fs.readFileSync(f, 'utf8');
  hits += raw.split(NOTE).length - 1;
  const rest = raw.split(NOTE).join('');
  const m = rest.match(VARIANT);
  assert.ok(!m, `dose-note variant "${m && m[0]}" in ${path.relative(root, f)}`);
});
assert.ok(hits >= 4, `expected unified note in utils + 3 configs, got ${hits}`);
['config/warmup.js', 'config/posture.js', 'config/exercise-cards.js'].forEach((f) =>
  assert.strictEqual(require(path.join(root, f))._meta.doseNote, NOTE, f));
const { DOSE_NOTE, DOSE_LABEL } = require('./lib/warmup');
const { CARD_DOSE_NOTE } = require('./lib/exerciseCards');
const { buildPostureView } = require('./lib/posture');
assert.deepStrictEqual([DOSE_NOTE, DOSE_LABEL, CARD_DOSE_NOTE, buildPostureView(require(path.join(root, 'config/posture.js'))).doseNote], [NOTE, NOTE, NOTE, NOTE]);
// 反例自检
assert.ok(VARIANT.test('通用康复建议，因人而异') && VARIANT.test('剂量为通用康复建议') && VARIANT.test('通用建议，因人而异'.slice(0)));
console.log('doseNote tests passed');
// D1：页面所用 constants/config 的任何可渲染字符串都不得含「占位」/「内容待补」
{
  const strings = [];
  const collect = (v, k) => {
    if (typeof v === 'string') { if (!/^(sourceNote|displayRules|image|imageRule|note|idMap)$/.test(k || '')) strings.push([k, v]); }
    else if (Array.isArray(v)) v.forEach((x) => collect(x, k));
    else if (v && typeof v === 'object') Object.keys(v).forEach((kk) => collect(v[kk], kk));
  };
  ['config/warmup.js', 'config/posture.js', 'config/exercise-cards.js'].forEach((f) => collect(require(path.join(root, f))));
  strings.forEach(([k, s]) => assert.ok(!/占位|内容待补|待核实|参考量待定/.test(s), `placeholder text in ${k}: ${s}`));
  walk(root).filter((f) => /constants\/.*\.ts$|\.wxml$/.test(f)).forEach((f) =>
    assert.ok(!/占位|内容待补/.test(fs.readFileSync(f, 'utf8')), `placeholder text in ${path.relative(root, f)}`));
}
console.log('placeholder scan passed');

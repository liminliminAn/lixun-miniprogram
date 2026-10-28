/** node tests/doseNote.test.js — 全站剂量说明只允许唯一文案「剂量为通用建议，因人而异」 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const NOTE = '剂量为通用建议，因人而异';
const root = path.join(__dirname, '../miniprogram');
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? (e.name === 'assets' ? [] : walk(path.join(d, e.name))) : [path.join(d, e.name)]);
const VARIANT = /通用(康复)?建议|因人而异/;
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

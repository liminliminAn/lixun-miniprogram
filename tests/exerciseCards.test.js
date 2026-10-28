/** node tests/exerciseCards.test.js — 图文卡配置合法性 */
const assert = require('assert');
const fs = require('fs');
const { buildExerciseCard, PLACEHOLDER_IMAGE } = require('./lib/exerciseCards');
const cfg = require('../miniprogram/config/exercise-cards.js');

const src = fs.readFileSync(__dirname + '/../miniprogram/constants/exercises.ts', 'utf8');
const ids = [...src.matchAll(/id: '([^']+)'/g)].map((m) => m[1]);
assert.ok(ids.length >= 15);
assert.ok(fs.existsSync(__dirname + '/../miniprogram' + PLACEHOLDER_IMAGE));
ids.forEach((id) => {
  const e = cfg.exercises[id];
  assert.ok(e, `missing card ${id}`);
  ['steps', 'cues', 'mistakes'].forEach((k) => {
    assert.ok(Array.isArray(e[k]) && e[k].length > 0, `${id}.${k}`);
    e[k].forEach((t) => assert.ok(typeof t === 'string' && t.trim()));
  });
  if (e.image) assert.ok(fs.existsSync(__dirname + '/../miniprogram' + e.image), `${id} image`);
  const v = buildExerciseCard(cfg, id);
  assert.strictEqual(v.image, PLACEHOLDER_IMAGE);
  assert.ok(/^\d(–\d)? 组 × \d+–\d+ 次 · /.test(v.dose), `${id} dose ${v.dose}`); // 剂量存在
  assert.strictEqual(v.doseNote, '通用建议，因人而异');
});
Object.keys(cfg.exercises).forEach((k) => assert.ok(ids.includes(k), `unknown id ${k}`));
const s = JSON.stringify(cfg);
['谭成义', '作者', 'author', 'attribution'].forEach((w) => assert.ok(!s.includes(w), `no attribution: ${w}`));
assert.strictEqual(buildExerciseCard(cfg, 'nope'), null);
assert.strictEqual(buildExerciseCard({ exercises: { a: { steps: ['x', ''], image: '/i.png' } } }, 'a').steps.length, 1);
assert.ok(!/待核实|参考量待定/.test(s));
const G = { A: ['barbell_bench', 'db_incline_press', 'dip', 'single_machine_row', 'flared_row', 'bulgarian_split_squat', 'goblet_squat', 'rdl', 'single_rdl'],
  B: ['single_cable_pulldown', 'neutral_lat_pulldown', 'back_extension'], C: ['skull_crusher', 'y_lateral_raise', 'cable_curl'] };
G.A.forEach((id) => assert.strictEqual(buildExerciseCard(cfg, id).dose, '3–4 组 × 6–10 次 · 留 2 次余量（RPE≈8） · 组间休息 2–3 分钟'));
G.B.forEach((id) => assert.strictEqual(buildExerciseCard(cfg, id).dose, '3 组 × 8–12 次 · RPE≈8 · 休息 90 秒'));
G.C.forEach((id) => assert.strictEqual(buildExerciseCard(cfg, id).dose, '3 组 × 10–15 次 · 可以接近力竭 · 休息 60–90 秒'));
assert.strictEqual([...G.A, ...G.B, ...G.C].length, Object.keys(cfg.exercises).length);
const wx = fs.readFileSync(__dirname + '/../miniprogram/components/exercise-card/exercise-card.wxml', 'utf8');
assert.ok(wx.includes('card.doseNote') && !wx.includes('参考量待定'));
console.log('exerciseCards tests passed');

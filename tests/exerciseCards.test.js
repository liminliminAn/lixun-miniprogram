/** node tests/exerciseCards.test.js — 图文卡配置合法性 */
const assert = require('assert');
const fs = require('fs');
const { buildExerciseCard, PLACEHOLDER_IMAGE } = require('./lib/exerciseCards');
const cfg = require('../miniprogram/config/exercise-cards.json');

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
  assert.strictEqual(v.dose, '参考量待定');
  assert.ok(!/\d+\s*(次|组|kg|秒|分钟)/.test(JSON.stringify(v)), `${id} 不显示数字剂量`);
});
Object.keys(cfg.exercises).forEach((k) => assert.ok(ids.includes(k), `unknown id ${k}`));
const s = JSON.stringify(cfg);
['谭成义', '作者', 'author', 'attribution'].forEach((w) => assert.ok(!s.includes(w), `no attribution: ${w}`));
assert.strictEqual(buildExerciseCard(cfg, 'nope'), null);
assert.strictEqual(buildExerciseCard({ exercises: { a: { steps: ['x', ''], image: '/i.png' } } }, 'a').steps.length, 1);
console.log('exerciseCards tests passed');

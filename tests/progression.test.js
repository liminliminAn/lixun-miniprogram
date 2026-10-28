/** node tests/progression.test.js — tests/lib/progression.js 由 miniprogram/utils/progression.ts 经 tsc 生成 */
const assert = require('assert');
const { suggestNext, DEFAULT_PROGRESSION: C, repRangeFromCards, withCardRepRanges } = require('./lib/progression');
const S = (n, reps, weight, done = true) => Array.from({ length: n }, () => ({ reps, weight, done }));

assert.strictEqual(suggestNext('barbell_bench', []), null); // 无历史
let r = suggestNext('barbell_bench', [S(4, 10, 60)]);
assert.deepStrictEqual([r.action, r.weight, r.reps], ['increase', 62.5, 6]); // 杠铃 +2.5
r = suggestNext('db_incline_press', [S(4, 10, 20)]);
assert.deepStrictEqual([r.action, r.weight], ['increase', 22]); // 哑铃 +1 档
r = suggestNext('single_machine_row', [S(4, 10, 40)]);
assert.deepStrictEqual([r.action, r.weight], ['increase', 45]); // 器械 +1 档
r = suggestNext('barbell_bench', [S(4, 8, 60)]);
assert.deepStrictEqual([r.action, r.weight, r.reps], ['maintain', 60, 8]); // 区间内未到上限
const miss = [...S(3, 8, 60), { reps: 4, weight: 60, done: true }];
r = suggestNext('barbell_bench', [miss, S(4, 8, 60)]);
assert.deepStrictEqual([r.action, r.weight], ['maintain', 60]); // 单次 miss 维持
r = suggestNext('barbell_bench', [[...S(3, 8, 60), { reps: 8, weight: 60, done: false }], S(4, 8, 60)]);
assert.strictEqual(r.action, 'maintain'); // 未勾选也算未完成
r = suggestNext('barbell_bench', [miss, miss]);
assert.deepStrictEqual([r.action, r.weight, r.reps], ['deload', 55, 6]); // 60*0.925=55.5 → 55
const miss80 = [...S(3, 8, 80), { reps: 3, weight: 80, done: true }];
assert.strictEqual(suggestNext('barbell_bench', [miss80, miss80]).weight, 72.5); // 74 → 72.5
assert.strictEqual(suggestNext('barbell_bench', [miss80, miss80], { ...C, deloadPct: 0.05 }).weight, 75); // 可配置
r = suggestNext('barbell_bench', [miss, miss], { ...C, deloadAfterMisses: 3 });
assert.strictEqual(r.action, 'maintain'); // 可配置次数
r = suggestNext('cable_curl', [S(3, 12, 15)]);
assert.deepStrictEqual([r.action, r.weight, r.reps], ['add_reps', 15, 13]); // 孤立先加次数
r = suggestNext('cable_curl', [S(3, 15, 15)]);
assert.deepStrictEqual([r.action, r.weight, r.reps], ['increase', 17.5, 10]); // 到上限加重回下限
r = suggestNext('dip', [S(3, 8, 0)]);
assert.deepStrictEqual([r.action, r.reps], ['add_reps', 9]); // 自重加次数
r = suggestNext('dip', [S(3, 10, 0)]);
assert.deepStrictEqual([r.action, r.weight], ['maintain', 0]);
r = suggestNext('unknown_x', [S(3, 15, 10)]);
assert.strictEqual(r.action, 'increase'); // 未配置按孤立/器械
console.log('progression tests passed');

// IT2-04：次数区间来自动作卡配置
{
  const cards = require('../miniprogram/config/exercise-cards.js');
  const R = repRangeFromCards(cards);
  assert.strictEqual(Object.keys(R).length, 15);
  ['single_cable_pulldown', 'neutral_lat_pulldown', 'back_extension'].forEach((id) => assert.deepStrictEqual(R[id], { min: 8, max: 12 }));
  assert.deepStrictEqual(R.barbell_bench, { min: 6, max: 10 });
  assert.deepStrictEqual(R.cable_curl, { min: 10, max: 15 });
  const P = withCardRepRanges(C, cards);
  let q = suggestNext('neutral_lat_pulldown', [S(3, 12, 50)], P);
  assert.deepStrictEqual([q.action, q.weight, q.reps], ['increase', 55, 8]); // 上限 12 达成 → 加重回 8
  q = suggestNext('neutral_lat_pulldown', [S(3, 10, 50)], P);
  assert.deepStrictEqual([q.action, q.reps], ['maintain', 10]); // 原 6–10 会加重，现 8–12 维持
  q = suggestNext('single_cable_pulldown', [S(3, 11, 20)], P);
  assert.deepStrictEqual([q.action, q.reps], ['add_reps', 12]); // 孤立加次数，封顶 12
  q = suggestNext('single_cable_pulldown', [S(3, 12, 20)], P);
  assert.deepStrictEqual([q.action, q.weight, q.reps], ['increase', 22.5, 8]);
  q = suggestNext('back_extension', [S(3, 12, 0)], P);
  assert.deepStrictEqual([q.action, q.reps], ['maintain', 12]); // 自重到 12 上限
  q = suggestNext('back_extension', [S(3, 11, 0)], P);
  assert.deepStrictEqual([q.action, q.reps], ['add_reps', 12]);
  q = suggestNext('barbell_bench', [S(4, 10, 60)], P);
  assert.deepStrictEqual([q.action, q.weight, q.reps], ['increase', 62.5, 6]);
  const ws = require('fs').readFileSync(__dirname + '/../miniprogram/services/workout.ts', 'utf8');
  assert.ok(/withCardRepRanges/.test(ws) && /suggestNext\(.*PROGRESSION\)/.test(ws));
  console.log('progression card-range tests passed');
}

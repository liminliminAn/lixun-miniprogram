/** node tests/weightTrend.test.js — tests/lib/weightTrend.js 由 miniprogram/utils/weightTrend.ts 经 tsc 生成 */
const assert = require('assert');
const W = require('./lib/weightTrend');
const T = '2026-10-27';
const d = (ago) => { const x = new Date(Date.UTC(2026, 9, 27 - ago)); return x.toISOString().slice(0, 10); };
const pts = (agos, kgFn) => agos.map((a) => ({ date: d(a), kg: kgFn(a) }));

// 空状态
assert.strictEqual(W.buildWeightTrend([], T, 'cut').empty, true);
assert.strictEqual(W.buildWeightTrend(pts([0], () => 70), T, 'cut').empty, true);
assert.strictEqual(W.buildWeightTrend(pts([0, 1], () => 70), T, 'cut').empty, false);

// 密度阈值：最近 7 天 3 条 → 只显示原始点
const sparse = pts([0, 2, 5, 8, 9, 10, 11], () => 70);
assert.strictEqual(W.isDense(sparse, T), false);
assert.strictEqual(W.movingAverage7(sparse, T), null);
let v = W.buildWeightTrend(sparse, T, 'cut');
assert.deepStrictEqual([v.dense, v.ma, v.weeklyChange, v.rhythm], [false, null, null, null]);
// 第 7 天前（ago=7）不算进最近 7 天
assert.strictEqual(W.isDense(pts([0, 1, 2, 7], () => 70), T), false);
assert.strictEqual(W.isDense(pts([0, 1, 2, 6], () => 70), T), true);

// 移动平均
const ma = W.movingAverage7(pts([0, 1, 2, 3], (a) => 70 + a), T);
assert.deepStrictEqual(ma.map((m) => m.ma), [73, 72.5, 72, 71.5]);

// 周均变化：两个窗口都要 ≥4
const twoWeeks = (cur, prev) => [...pts([0, 1, 2, 3], () => cur), ...pts([7, 8, 9, 10], () => prev)];
assert.strictEqual(W.weeklyAvgChange(twoWeeks(69.5, 70), T), -0.5);
assert.strictEqual(W.weeklyAvgChange([...pts([0, 1, 2, 3], () => 70), ...pts([7, 8, 9], () => 71)], T), null);

// 共用判定：80kg → 上限 min(1, 0.8)=0.8
assert.strictEqual(W.judgeWeeklyRate(-0.2, 80), 'stable');
assert.strictEqual(W.judgeWeeklyRate(-0.8, 80), 'stable');
assert.strictEqual(W.judgeWeeklyRate(-0.81, 80), 'too_fast');
assert.strictEqual(W.judgeWeeklyRate(-0.1, 80), 'slow');
assert.strictEqual(W.judgeWeeklyRate(0.3, 80), 'slow');
// 120kg → 上限封顶 1.0
assert.strictEqual(W.judgeWeeklyRate(-1.0, 120), 'stable');
assert.strictEqual(W.judgeWeeklyRate(-1.1, 120), 'too_fast');

// 节奏卡：cut/recomp 显示，bulk/beginner 隐藏；软提示与节奏卡同源
v = W.buildWeightTrend(twoWeeks(69.5, 70), T, 'cut');
assert.deepStrictEqual([v.rhythm, v.softTip], ['stable', false]);
v = W.buildWeightTrend(twoWeeks(69, 70), T, 'recomp'); // 降 1kg > 0.69
assert.deepStrictEqual([v.rhythm, v.softTip], ['too_fast', true]);
['bulk', 'beginner'].forEach((c) => {
  const b = W.buildWeightTrend(twoWeeks(69, 70), T, c);
  assert.deepStrictEqual([b.rhythm, b.softTip, b.weeklyChange], [null, false, -1]);
});
console.log('weightTrend tests passed');

/** node tests/startedRule.test.js — §3.4-9 记下第一组或勾选第一个热身项才算开练；空草稿不锁类型、不计记录/连练 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const S = require('./lib/schedule');
const W = require('./lib/warmup');
const read = (p) => fs.readFileSync(path.join(__dirname, '../miniprogram', p), 'utf8');
const today = '2026-10-29'; // idx=3
const week = ['push', 'pull', 'legs', 'rest', 'pull', 'rest', 'rest'];

// 只打开训练页：生成 4 组未勾选草稿
const draft = { dayType: 'legs', completedAt: null, exercises: [{ exerciseId: 'squat', sets: [{ reps: 8, weight: 60, done: false }, { reps: 8, weight: 60, done: false }] }] };
// 只打开热身页：warmup 无勾选
const warmOpen = { ...draft, warmup: { status: 'skipped', checked: [] } };
const setLogged = { ...draft, exercises: [{ exerciseId: 'squat', sets: [{ reps: 8, weight: 60, done: true }, { reps: 8, weight: 60, done: false }] }] };
const warmTicked = { ...draft, warmup: { status: 'partial', checked: ['hip_01'] } };

for (const s of [null, undefined, {}, draft, warmOpen]) assert.strictEqual(S.isStarted(s), false);
for (const s of [setLogged, warmTicked, { ...draft, completedAt: 'x' }]) assert.strictEqual(S.isStarted(s), true);

// 空草稿：不固定今天类型、不锁定
assert.strictEqual(S.pinnedTodayType(week, 3, draft), 'rest');
assert.strictEqual(S.pinnedTodayType(week, 3, warmOpen), 'rest');
assert.strictEqual(S.isTodayLocked(draft), false);
let c = S.buildWeekCells(week, today, 0, { [today]: draft })[3];
assert.strictEqual(c.dayType, 'rest'); assert.strictEqual(c.editable, true); assert.strictEqual(c.hasRecord, false);
// 记下一组 / 勾选热身 → 固定 + 锁定
for (const s of [setLogged, warmTicked]) {
  assert.strictEqual(S.pinnedTodayType(week, 3, s), 'legs');
  c = S.buildWeekCells(week, today, 0, { [today]: s })[3];
  assert.strictEqual(c.dayType, 'legs'); assert.strictEqual(c.editable, false); assert.strictEqual(S.tapAction(c), 'locked');
}
// 过去日空草稿 = 无记录
c = S.buildWeekCells(week, today, 0, { '2026-10-27': { ...draft, dayType: 'pull' } })[1];
assert.strictEqual(c.noRecord, true); assert.strictEqual(c.hasRecord, false); assert.strictEqual(c.trained, false);
assert.strictEqual(S.tapAction(c), 'none');
// 空草稿开练时按当前生效类型重开
assert.strictEqual(S.restoreDecision(draft, 'push'), 'fresh');
// 连练不计空草稿
assert.deepStrictEqual(W.completedTrainDates({ '2026-10-27': draft, '2026-10-28': setLogged, '2026-10-26': { ...setLogged, completedAt: 'y' } }), ['2026-10-26']);

// 接线：记录页过滤空草稿；workout 计数用 isTrained
assert.ok(/filter\(\(d\) => isStarted\(sessions\[d\]/.test(read('pages/log/log.ts')));
assert.ok(/isTrained\(sessions\[d\]/.test(read('services/workout.ts')));
console.log('startedRule.test ok');

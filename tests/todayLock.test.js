/** node tests/todayLock.test.js — §3.4-4 今天开练/完成后锁定类型；开练只恢复与生效类型一致的记录 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const S = require('./lib/schedule');
const read = (p) => fs.readFileSync(path.join(__dirname, '../miniprogram', p), 'utf8');

const today = '2026-10-29';
const week = ['push', 'pull', 'legs', 'push', 'pull', 'rest', 'rest'];
// 无记录 → 今天可改
let c = S.buildWeekCells(week, today, 0, {})[3];
assert.strictEqual(c.editable, true); assert.strictEqual(S.tapAction(c), 'edit');
// 已开练（未完成）→ 锁定
c = S.buildWeekCells(week, today, 0, { [today]: { dayType: 'push', completedAt: null, exercises: [{ exerciseId: 'b', sets: [{ done: true }] }] } })[3];
assert.strictEqual(c.editable, false); assert.strictEqual(S.tapAction(c), 'locked');
// 已完成 → 锁定
c = S.buildWeekCells(week, today, 0, { [today]: { dayType: 'push', completedAt: 'x' } })[3];
assert.strictEqual(S.tapAction(c), 'locked');
assert.strictEqual(S.isTodayLocked(null), false);
assert.strictEqual(S.isTodayLocked({ dayType: 'pull', warmup: { checked: ['x'] } }), true);
// 明天不受影响
assert.strictEqual(S.buildWeekCells(week, today, 0, { [today]: { dayType: 'push', completedAt: 'x' } })[4].editable, true);

// 恢复逻辑
assert.strictEqual(S.restoreDecision(null, 'push'), 'fresh');
assert.strictEqual(S.restoreDecision({ dayType: 'push' }, 'push'), 'restore');
assert.strictEqual(S.restoreDecision({ dayType: 'pull' }, 'push'), 'fresh');
assert.strictEqual(S.restoreDecision({ dayType: 'pull', completedAt: 'x' }, 'push'), 'completed');

// 接线：锁定只 toast，不弹放弃确认；workout 用 restoreDecision
const ts = read('pages/plan/plan.ts');
assert.ok(/action === 'locked'[\s\S]*?showToast\(\{ title: TODAY_LOCKED_TIP/.test(ts));
assert.ok(!/放弃/.test(ts));
const w = read('services/workout.ts');
assert.ok(/restoreDecision\(existing, dayType\)/.test(w) && /decision !== 'fresh'\) return existing/.test(w));
console.log('todayLock.test ok');

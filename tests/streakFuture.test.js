/** node tests/streakFuture.test.js — P3-C：只看含今天或未来日的连练，>3 天才提示；已结束的过去连练不提示 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const S = require('./lib/schedule');
const R = 'rest';
const today = '2026-10-29'; // 周四
const done = (t) => ({ dayType: t, completedAt: 'x' });
const ti = S.streakTodayIndex(today);
assert.strictEqual(ti, 6);
assert.strictEqual(S.streakTodayIndex('2026-10-26'), 3);
assert.strictEqual(S.streakTodayIndex('2026-11-01'), 9);
// 今天计划休，前 6 天（上周五~本周三）都练 → 不提示
const past6 = { '2026-10-23': done('push'), '2026-10-24': done('pull'), '2026-10-25': done('legs'), '2026-10-26': done('push'), '2026-10-27': done('pull'), '2026-10-28': done('legs') };
const rest = [R, R, R, R, R, R, R];
const d1 = S.streakDays(rest, today, {}, null, past6);
assert.strictEqual(S.maxConsecutiveLinear(d1), 6);
assert.strictEqual(S.streakSoftTipDays(d1, ti), '');
// 同样 6 天，今天计划练 → 连到今天 7 天，提示
const d2 = S.streakDays(rest, today, { [today]: 'push' }, null, past6);
assert.strictEqual(S.streakSoftTipDays(d2, ti), S.STREAK_SOFT_TIP);
// 过去 3 天 + 今天 = 4，提示；过去 2 天 + 今天 = 3，不提示
const p3 = { '2026-10-26': done('push'), '2026-10-27': done('pull'), '2026-10-28': done('legs') };
assert.strictEqual(S.streakSoftTipDays(S.streakDays(rest, today, { [today]: 'push' }, null, p3), ti), S.STREAK_SOFT_TIP);
const p2 = { '2026-10-27': done('pull'), '2026-10-28': done('legs') };
assert.strictEqual(S.streakSoftTipDays(S.streakDays(rest, today, { [today]: 'push' }, null, p2), ti), '');
// 全在未来的连练（下周一~周四）也提示
const fut = { '2026-11-02': 'push', '2026-11-03': 'pull', '2026-11-04': 'legs', '2026-11-05': 'push' };
assert.strictEqual(S.streakSoftTipDays(S.streakDays(rest, today, fut, null, {}), ti), S.STREAK_SOFT_TIP);
// 今天已开练按记录固定，算在今天
assert.strictEqual(S.streakSoftTipDays(S.streakDays(rest, today, {}, { dayType: 'legs', warmup: { checked: ['w'] } }, p3), ti), S.STREAK_SOFT_TIP);
// maxRunReaching 边界
assert.strictEqual(S.maxRunReaching(['push', 'push', R, 'push'], 2), 1);
assert.strictEqual(S.maxRunReaching(['push', 'push', R, 'push'], 1), 2);
assert.strictEqual(S.maxRunReaching([], 0), 0);
// 页面接线
const ts = fs.readFileSync(path.join(__dirname, '../miniprogram/pages/plan/plan.ts'), 'utf8');
assert.strictEqual((ts.match(/streakSoftTipDays\(pinnedDays\(\), streakTodayIndex\(formatDate\(\)\)\)/g) || []).length, 2);
console.log('streakFuture.test ok');

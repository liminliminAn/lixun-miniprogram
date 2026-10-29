/** node tests/streakActual.test.js — P3-A：连练软提示过去日按实际记录（开练或 completedAt），漏练不算；今天及以后按计划 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const S = require('./lib/schedule');
const R = 'rest';
const today = '2026-10-29'; // 周四
const tmpl = ['push', 'pull', 'legs', 'push', 'pull', R, R];
// 只按计划：周一~周五 5 连练 → 提示
assert.strictEqual(S.maxConsecutiveLinear(S.pinnedResolvedDays(tmpl, today, {}, null).slice(0, 7)), 5);
// 过去三天都漏练 → 只剩周四周五 2 天，不提示
const none = S.pinnedResolvedDays(tmpl, today, {}, null, {});
assert.deepStrictEqual(none.slice(0, 3), [R, R, R]);
assert.strictEqual(S.maxConsecutiveLinear(none.slice(0, 7)), 2); // 下周按计划另算
// 只有草稿（无完成组、无热身勾选、无 completedAt）不算
const draft = { '2026-10-26': { dayType: 'push', exercises: [{ exerciseId: 'a', sets: [{ weight: 20, reps: 8, done: false }] }] } };
assert.strictEqual(S.pinnedResolvedDays(tmpl, today, {}, null, draft)[0], R);
// 完成一组 / 勾热身 / completedAt 都算，并按记录类型
const real = {
  '2026-10-26': { dayType: 'legs', exercises: [{ exerciseId: 'a', sets: [{ done: true }] }] },
  '2026-10-27': { dayType: 'pull', warmup: { checked: ['w1'] } },
  '2026-10-28': { dayType: 'push', completedAt: '2026-10-28T20:00:00' },
};
const d = S.pinnedResolvedDays(tmpl, today, {}, null, real);
assert.deepStrictEqual(d.slice(0, 5), ['legs', 'pull', 'push', 'push', 'pull']);
assert.strictEqual(S.streakSoftTipDays(d), S.STREAK_SOFT_TIP);
// 过去日覆盖不影响实际；未来覆盖仍生效
assert.strictEqual(S.pinnedResolvedDays(tmpl, today, { '2026-10-26': 'push', '2026-10-31': 'legs' }, null, {})[0], R);
assert.strictEqual(S.pinnedResolvedDays(tmpl, today, { '2026-10-31': 'legs' }, null, {})[5], 'legs');
// 今天按计划（未开练），已开练按记录固定
assert.strictEqual(S.pinnedResolvedDays(tmpl, today, {}, null, {})[3], 'push');
assert.strictEqual(S.pinnedResolvedDays(tmpl, today, {}, { dayType: 'legs', warmup: { checked: ['w'] } }, {})[3], 'legs');
// 页面接线：把全部记录传进去
const ts = fs.readFileSync(path.join(__dirname, '../miniprogram/pages/plan/plan.ts'), 'utf8');
assert.ok(/streakDays\(getPlanWeek\(\), today, getDateOverrides\(\), sessions\[today\], sessions\)/.test(ts));
console.log('streakActual.test ok');

/** node tests/streakLookback.test.js — 连练回看上周五~周日（实际记录），跨周连续计算 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const S = require('./lib/schedule');
const R = 'rest';
const today = '2026-10-29'; // 周四；上周五 10/23、周六 10/24、周日 10/25
const tmpl = [R, R, R, R, R, R, R];
const done = (t) => ({ dayType: t, completedAt: 'x' });
assert.strictEqual(S.STREAK_LOOKBACK_DAYS, 3);
// 上周日 + 本周一~周三 实练 = 4 → 提示
const s1 = { '2026-10-25': done('legs'), '2026-10-26': done('push'), '2026-10-27': done('pull'), '2026-10-28': done('legs') };
const d1 = S.streakDays(tmpl, today, {}, null, s1);
assert.strictEqual(d1.length, 17);
assert.deepStrictEqual(d1.slice(0, 3), [R, R, 'legs']);
assert.strictEqual(S.maxConsecutiveLinear(d1), 4);
assert.strictEqual(S.streakSoftTipDays(d1), S.STREAK_SOFT_TIP);
// 只有本周一~周三 3 天 → 不提示
const s2 = { '2026-10-26': done('push'), '2026-10-27': done('pull'), '2026-10-28': done('legs') };
assert.strictEqual(S.streakSoftTipDays(S.streakDays(tmpl, today, {}, null, s2)), '');
// 回看日按实际：计划/覆盖不算，草稿不算，热身勾选算
assert.deepStrictEqual(S.streakDays(['push', 'push', 'push', 'push', 'push', 'push', 'push'], today, { '2026-10-24': 'push' }, null, {}).slice(0, 3), [R, R, R]);
const s3 = { '2026-10-23': { dayType: 'push', exercises: [{ exerciseId: 'a', sets: [{ done: false }] }] }, '2026-10-24': { dayType: 'pull', warmup: { checked: ['w'] } } };
assert.deepStrictEqual(S.streakDays(tmpl, today, {}, null, s3).slice(0, 3), [R, 'pull', R]);
// 上周五~周日 3 天 + 本周一 1 天 = 4
const s4 = { '2026-10-23': done('push'), '2026-10-24': done('pull'), '2026-10-25': done('legs'), '2026-10-26': done('push') };
assert.strictEqual(S.streakSoftTipDays(S.streakDays(tmpl, today, {}, null, s4)), S.STREAK_SOFT_TIP);
// 今天及以后仍按计划：上周日 + 本周一 实练，今天起计划练 → 周二周三漏练断开
const s5 = { '2026-10-25': done('legs'), '2026-10-26': done('push') };
assert.strictEqual(S.maxConsecutiveLinear(S.streakDays(tmpl, today, { '2026-10-29': 'push', '2026-10-30': 'pull' }, null, s5)), 2);
// 页面接线
const ts = fs.readFileSync(path.join(__dirname, '../miniprogram/pages/plan/plan.ts'), 'utf8');
assert.ok(/streakSoftTipDays\(pinnedDays\(\)\)/.test(ts) && /return streakDays\(/.test(ts));
console.log('streakLookback.test ok');

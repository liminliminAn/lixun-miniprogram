/** node tests/streakLinear.test.js — P3-2：周视图连练提示按具体日期线性计算，本周日不接回本周一，下周一按真实覆盖接上 */
const assert = require('assert');
const S = require('./lib/schedule');
const R = 'rest';
const today = '2026-10-29'; // 周四
const tmpl = ['push', 'pull', R, R, R, 'legs', 'push'];
// 线性计算：周六日不接回周一二
const days = S.pinnedResolvedDays(tmpl, today, {}, null);
assert.strictEqual(days.length, 14);
assert.strictEqual(S.maxConsecutiveLinear(days.slice(0, 7)), 2);
// 跨到下周一用的是下周真实日期：本周日 + 下周一二 + 下周三覆盖为推 → 周六~下周三 5 天
const d2 = S.pinnedResolvedDays(tmpl, today, { '2026-11-04': 'push' }, null);
assert.strictEqual(S.maxConsecutiveLinear(d2), 5);
assert.strictEqual(S.streakSoftTipDays(d2), S.STREAK_SOFT_TIP);
// 下周一覆盖为休 → 断开
const d3 = S.pinnedResolvedDays(tmpl, today, { '2026-11-02': R }, null);
assert.strictEqual(S.maxConsecutiveLinear(d3), 2);
assert.strictEqual(S.streakSoftTipDays(d3), '');
assert.strictEqual(S.maxConsecutiveLinear([]), 0);
console.log('streakLinear.test ok');

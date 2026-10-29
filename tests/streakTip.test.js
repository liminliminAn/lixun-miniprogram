/** node tests/streakTip.test.js — §3.4-6 连续训练 >3 天软提示（按具体日期线性计算），不拦截保存 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const S = require('./lib/schedule');
const R = 'rest';
assert.strictEqual(S.maxConsecutiveLinear(['push', 'pull', 'legs', R, 'pull', R, R]), 3);
assert.strictEqual(S.streakSoftTipDays(['push', 'pull', 'legs', R, 'pull', R, R]), '');
assert.strictEqual(S.maxConsecutiveLinear(['push', 'pull', 'legs', 'push', R, R, R]), 4);
assert.ok(S.streakSoftTipDays(['push', 'pull', 'legs', 'push', R, R, R]));
// 不循环：周六周日不接回周一
assert.strictEqual(S.maxConsecutiveLinear(['push', 'pull', R, R, R, 'legs', 'push']), 2);
assert.strictEqual(S.maxConsecutiveLinear(['push', 'pull', 'legs', 'push', 'pull', 'legs', 'push']), 7);
assert.strictEqual(S.maxConsecutiveLinear([R, R, R, R, R, R, R]), 0);
const ts = fs.readFileSync(path.join(__dirname, '../miniprogram/pages/plan/plan.ts'), 'utf8');
assert.ok(/setDateOverride\(date, kind\);[\s\S]*streakSoftTipDays\(pinnedDays\(\), streakTodayIndex\(formatDate\(\)\)\)/.test(ts), '先保存再软提示');
console.log('streakTip.test ok');

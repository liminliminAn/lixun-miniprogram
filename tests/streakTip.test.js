/** node tests/streakTip.test.js — §3.4-6 自定义课表连续训练 >3 天软提示（跨周循环），不拦截保存 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const S = require('./lib/schedule');
const R = 'rest';
assert.strictEqual(S.maxConsecutiveTraining(['push', 'pull', 'legs', R, 'pull', R, R]), 3);
assert.strictEqual(S.streakSoftTip(['push', 'pull', 'legs', R, 'pull', R, R]), '');
assert.strictEqual(S.maxConsecutiveTraining(['push', 'pull', 'legs', 'push', R, R, R]), 4);
assert.ok(S.streakSoftTip(['push', 'pull', 'legs', 'push', R, R, R]));
// 跨周：周六、周日、周一、周二 = 4
const wrap = ['push', 'pull', R, R, R, 'legs', 'push'];
assert.strictEqual(S.maxConsecutiveTraining(wrap), 4);
assert.ok(S.streakSoftTip(wrap));
assert.strictEqual(S.maxConsecutiveTraining(['push', 'pull', 'legs', 'push', 'pull', 'legs', 'push']), 7);
assert.strictEqual(S.maxConsecutiveTraining([R, R, R, R, R, R, R]), 0);
const ts = fs.readFileSync(path.join(__dirname, '../miniprogram/pages/plan/plan.ts'), 'utf8');
assert.ok(/saveCustomSchedule\(next\);[\s\S]*streakSoftTip\(next\.week\)/.test(ts), '先保存再软提示');
console.log('streakTip.test ok');

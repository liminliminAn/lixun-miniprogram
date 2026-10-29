/** node tests/streakPinned.test.js — plan 页连练软提示按「今天已固定」的生效课表计算 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const S = require('./lib/schedule');
// 课表：周一~周三练，周四(今天 idx=3)休，周五练 → 未固定时最长连练 3，不提示
const week = ['push', 'pull', 'legs', 'rest', 'push', 'rest', 'rest'];
const started = { dayType: 'legs', exercises: [{ exerciseId: 'squat', sets: [{ done: true }] }] };
const pinned = S.weekWithTodayPinned(week, 3, started);
assert.deepStrictEqual(pinned, ['push', 'pull', 'legs', 'legs', 'push', 'rest', 'rest']);
assert.deepStrictEqual(week[3], 'rest', '不改原数组');
assert.strictEqual(S.streakSoftTipDays(week), '');
assert.ok(S.streakSoftTipDays(pinned), '今天已开练腿 → 连练 5 天，应提示');
// 空草稿不固定
assert.deepStrictEqual(S.weekWithTodayPinned(week, 3, { dayType: 'legs', exercises: [{ exerciseId: 'squat', sets: [{ done: false }] }] }), week);
assert.deepStrictEqual(S.weekWithTodayPinned(week, 3, null), week);
// 接线
const ts = fs.readFileSync(path.join(__dirname, '../miniprogram/pages/plan/plan.ts'), 'utf8');
assert.ok(/streakTip: streakSoftTipDays\(pinnedDays\(\), streakTodayIndex\(formatDate\(\)\)\)/.test(ts));
assert.ok(!/streakSoftTip\(getPlanWeek\(\)\)/.test(ts));
assert.ok(/streakDays\(getPlanWeek\(\), today, getDateOverrides\(\)/.test(ts));
console.log('streakPinned.test ok');

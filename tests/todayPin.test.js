/** node tests/todayPin.test.js — §3.4-8 今天已有记录时，恢复默认/改天数/重做问卷不改今天类型，从明天起生效 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const S = require('./lib/schedule');
const T = require('./lib/templates');
const today = '2026-10-29'; // 周四 idx=3

const custom = { week: ['push', 'pull', 'legs', 'legs', 'pull', 'rest', 'rest'] };
const sess = { [today]: { dayType: 'legs', completedAt: null, exercises: [] } };

// 用户开练了腿，然后 恢复默认（自定义清除，默认 4 练周四=休）
let week = S.effectiveWeek(T.buildWeekPlan(4).week, null);
assert.strictEqual(week[3], 'rest');
assert.strictEqual(S.pinnedTodayType(week, 3, sess[today]), 'legs', '今天保持已开练的类型');
let cells = S.buildWeekCells(week, today, 0, sess);
assert.strictEqual(cells[3].dayType, 'legs');
assert.strictEqual(cells[4].dayType, week[4], '明天起按新课表');
// 未完成记录被恢复（类型一致）
assert.strictEqual(S.restoreDecision(sess[today], S.pinnedTodayType(week, 3, sess[today])), 'restore');

// 改天数 → 5 练（周四=休）；已完成同样固定
const done = { [today]: { dayType: 'legs', completedAt: 'x' } };
week = T.buildWeekPlan(5).week;
assert.strictEqual(S.buildWeekCells(week, today, 0, done)[3].dayType, 'legs');
// 重做问卷 → 3 练（周四=休）
week = T.buildWeekPlan(3).week;
assert.strictEqual(S.buildWeekCells(week, today, 0, sess)[3].dayType, 'legs');

// 今天无记录 → 立即生效
assert.strictEqual(S.pinnedTodayType(T.buildWeekPlan(3).week, 3, null), 'rest');
assert.strictEqual(S.buildWeekCells(S.effectiveWeek(T.buildWeekPlan(4).week, custom), today, 0, {})[3].dayType, 'legs');
// 日期过了自动失效：明天的格子不受今天记录影响
assert.strictEqual(S.buildWeekCells(T.buildWeekPlan(3).week, '2026-10-30', 0, sess)[4].dayType, T.buildWeekPlan(3).week[4]);

// 接线：todayDayType 走 pin
const w = fs.readFileSync(path.join(__dirname, '../miniprogram/services/workout.ts'), 'utf8');
assert.ok(/pinnedTodayType\(getEffectiveWeek\(\), mondayBasedIndex\(date\), getSession\(formatDate\(date\)\)\)/.test(w));
console.log('todayPin.test ok');

/** node tests/monthReadOnly.test.js — §3.5-1/6：月历只读；点日期弹类型+记录摘要；月历不显示自定义标签和连练软提示 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const M = require('./lib/monthGrid');
const read = (p) => fs.readFileSync(path.join(__dirname, '../miniprogram', p), 'utf8');
const today = '2026-10-29';
const week = ['push', 'pull', 'legs', 'rest', 'push', 'pull', 'rest'];
const sessions = {
  '2026-10-26': { dayType: 'push', completedAt: 'x', exercises: [{ exerciseId: 'bench', sets: [{ weight: 60, reps: 8, done: true }] }] },
  [today]: { dayType: 'legs', completedAt: null, exercises: [{ exerciseId: 'sq', sets: [{ weight: 80, reps: 5, done: true }] }] },
};
const cells = M.buildMonthCells(2026, 10, today, week, sessions, '2026-10-01');
const at = (d) => cells.find((c) => c.date === d);
const nm = (id) => id;
let p = M.monthDayPopup(at('2026-10-26'), sessions['2026-10-26'], nm);
assert.strictEqual(p.title, '10/26 周一');
assert.ok(p.content.startsWith('推日\n已完成') && /bench：60kg×8/.test(p.content));
p = M.monthDayPopup(at(today), sessions[today], nm);
assert.ok(p.content.startsWith('腿日\n未完成') && /sq：80kg×5/.test(p.content));
assert.strictEqual(M.monthDayPopup(at('2026-10-30'), undefined, nm).content, '计划：推日'); // 未来只显示计划类型
assert.strictEqual(M.monthDayPopup(at('2026-10-27'), undefined, nm).content, '未训练/休息');
assert.ok(M.buildMonthCells(2026, 10, '2026-10-26', week, {}, '2026-10-01').find((c) => c.date === '2026-10-26') && /今天还没有训练记录/.test(M.monthDayPopup(M.buildMonthCells(2026, 10, '2026-10-26', week, {}, '2026-10-01').find((c) => c.date === '2026-10-26'), undefined, nm).content));
const ts = read('pages/plan/plan.ts');
const tapMonth = ts.slice(ts.indexOf('onTapMonthDay'), ts.indexOf('onPrevWeek'));
assert.ok(/monthDayPopup/.test(tapMonth) && /showModal/.test(tapMonth));
assert.ok(!/showActionSheet|saveCustomSchedule|setDay|editSheetTitle/.test(tapMonth), '月历不改课表');
const tapWeek = ts.slice(ts.indexOf('onTapDay'));
assert.ok(/editSheetTitle\(idx\)/.test(tapWeek) && /showActionSheet/.test(tapWeek) && /saveCustomSchedule/.test(tapWeek)); // 周视图保留编辑
const wxml = read('pages/plan/plan.wxml');
assert.ok(/wx:if="\{\{customized && !expanded\}\}">自定义/.test(wxml));
assert.ok(/wx:if="\{\{streakTip && !expanded\}\}"/.test(wxml));
assert.ok(/customized && !expanded\}\}" bindtap="onRestoreDefault"/.test(wxml));
console.log('monthReadOnly.test ok');

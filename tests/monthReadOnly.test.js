/** node tests/monthReadOnly.test.js — 选项 B：月历本月今天（未开练）及以后可改当天（日期覆盖）；过去日只看记录弹窗；不可点规则不变 */
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
// 弹窗（过去日 / 已锁定今天）
let p = M.monthDayPopup(at('2026-10-26'), sessions['2026-10-26'], nm);
assert.strictEqual(p.title, '10/26 周一');
assert.ok(p.content.startsWith('推日\n已完成') && /bench：60kg×8/.test(p.content));
p = M.monthDayPopup(at(today), sessions[today], nm);
assert.ok(p.content.startsWith('腿日\n未完成') && /sq：80kg×5/.test(p.content));
assert.strictEqual(M.monthDayPopup(at('2026-10-27'), undefined, nm).content, '未训练/休息');
// 可改
assert.strictEqual(at('2026-10-26').editable, false); // 过去
assert.strictEqual(at(today).editable, false); // 今天已开练 → 锁定
assert.strictEqual(at('2026-10-30').editable, true);
assert.strictEqual(M.buildMonthCells(2026, 10, today, week, {}, '2026-10-01').find((c) => c.date === today).editable, true);
assert.strictEqual(M.buildMonthCells(2026, 10, today, week, {}, '2026-10-30').find((c) => c.date === today).editable, false); // 首次使用前
// 接线：月历可改 → editDate；过去日 → 弹窗；锁定今天 → toast
const ts = read('pages/plan/plan.ts');
const tapMonth = ts.slice(ts.indexOf('onTapMonthDay'), ts.indexOf('onPrevWeek'));
assert.ok(/!cell\.tappable\) return/.test(tapMonth) && /if \(cell\.editable\) \{\s*this\.editDate\(cell\.date\)/.test(tapMonth));
assert.ok(/cell\.isToday[\s\S]*TODAY_LOCKED_TIP/.test(tapMonth) && /monthDayPopup/.test(tapMonth) && /showModal/.test(tapMonth));
assert.ok(!/saveCustomSchedule|setDay\(/.test(ts), '不再按星期改模板');
const tapWeek = ts.slice(ts.indexOf('onTapDay'), ts.indexOf('onRestoreDefault'));
assert.ok(/this\.editDate\(cell\.date\)/.test(tapWeek) && /alertText: overrideSheetTitle\(date\)/.test(tapWeek) && /setDateOverride\(date, kind\)/.test(tapWeek));
// 展开时也显示自定义标签、连练提示和恢复默认
const wxml = read('pages/plan/plan.wxml');
assert.ok(/wx:if="\{\{customized\}\}">自定义/.test(wxml));
assert.ok(/wx:if="\{\{streakTip\}\}"/.test(wxml));
assert.ok(/wx:if="\{\{restorable\}\}" bindtap="onRestoreDefault"/.test(wxml));
assert.ok(!/(customized|streakTip|restorable)[^}]*!expanded/.test(wxml));
console.log('monthReadOnly.test ok');

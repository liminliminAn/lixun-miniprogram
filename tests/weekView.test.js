/** node tests/weekView.test.js — 计划页周视图：日期/翻周、完成标记、过去日禁改（tests/lib/schedule.js 由 utils/schedule.ts 经 tsc 生成） */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const S = require('./lib/schedule');
const read = (p) => fs.readFileSync(path.join(__dirname, '../miniprogram', p), 'utf8');

// 2026-10-29 是周四
const today = '2026-10-29';
assert.deepStrictEqual(S.weekDates(today, 0), ['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01']);
assert.deepStrictEqual(S.weekDates(today, -1)[0], '2026-10-19');
assert.deepStrictEqual(S.weekDates('2026-11-01', 0)[0], '2026-10-26'); // 周日归本周
assert.deepStrictEqual(S.weekDates('2026-10-26', 0)[6], '2026-11-01'); // 周一
assert.deepStrictEqual(S.weekDates('2026-01-01', -1)[0], '2025-12-22'); // 跨年
assert.deepStrictEqual(S.weekDates(today, 3), S.weekDates(today, 0)); // 不能翻过本周
assert.strictEqual(S.clampWeekOffset(2), 0);
assert.strictEqual(S.clampWeekOffset(-2), -2);
assert.strictEqual(S.shortDate('2026-10-27'), '10/27');
assert.strictEqual(S.shortDate('2026-01-05'), '1/5');

// 时态与可改
assert.strictEqual(S.dayTense('2026-10-28', today), 'past');
assert.strictEqual(S.dayTense(today, today), 'today');
assert.strictEqual(S.dayTense('2026-10-30', today), 'future');
assert.strictEqual(S.canEditDay('2026-10-28', today), false);
assert.strictEqual(S.canEditDay(today, today), true);
assert.strictEqual(S.canEditDay('2026-11-01', today), true);

// 完成标记只认 completedAt
const week = ['push', 'pull', 'legs', 'rest', 'pull', 'rest', 'rest'];
const sessions = {
  '2026-10-26': { dayType: 'push', completedAt: '2026-10-26T12:00:00Z', exercises: [{ exerciseId: 'bench', sets: [{ weight: 60, reps: 8 }] }] },
  '2026-10-27': { dayType: 'pull', completedAt: null, exercises: [] },
};
const cells = S.buildWeekCells(week, today, 0, sessions);
assert.strictEqual(cells.length, 7);
assert.deepStrictEqual(cells.map((c) => c.md), ['10/26', '10/27', '10/28', '10/29', '10/30', '10/31', '11/1']);
assert.deepStrictEqual(cells.map((c) => c.isToday), [false, false, false, true, false, false, false]);
assert.deepStrictEqual(cells.map((c) => c.trained), [true, false, false, false, false, false, false]);
assert.deepStrictEqual(cells.map((c) => c.editable), [false, false, false, true, true, true, true]);
assert.strictEqual(S.isTrained({ completedAt: '' }), false);

// 点击：过去日不开 ActionSheet；有记录看记录，无记录 toast
assert.strictEqual(S.tapAction(cells[0]), 'record');
assert.strictEqual(S.tapAction(cells[1]), 'record');
assert.strictEqual(S.tapAction(cells[2]), 'none');
assert.strictEqual(S.tapAction(cells[3]), 'edit');
assert.strictEqual(S.tapAction(cells[6]), 'edit');
assert.ok(/bench：60kg×8/.test(S.sessionSummary(sessions['2026-10-26'], (id) => id)));
// 上一周全部为过去日、都不可改
assert.ok(S.buildWeekCells(week, today, -1, {}).every((c) => !c.editable && S.tapAction(c) === 'none'));

// 接线
const ts = read('pages/plan/plan.ts');
assert.ok(/tapAction\(cell\)/.test(ts) && /action === 'none'[\s\S]*showToast/.test(ts) && /action === 'record'[\s\S]*return;[\s\S]*showActionSheet/.test(ts));
assert.ok(/onPrevWeek/.test(ts) && /onNextWeek[\s\S]*weekOffset >= 0\) return/.test(ts));
const wxml = read('pages/plan/plan.wxml');
assert.ok(/onPrevWeek/.test(wxml) && /onNextWeek/.test(wxml) && /\{\{item\.md\}\}/.test(wxml) && /item\.isToday/.test(wxml) && /item\.trained/.test(wxml));
// §3.4-7：过去日只显示实际记录；无记录不显示课表类型
{ const cs = S.buildWeekCells(['push', 'pull', 'legs', 'push', 'pull', 'rest', 'rest'], today, 0, sessions);
  assert.strictEqual(cs[0].dayType, 'push'); assert.strictEqual(cs[0].noRecord, false);
  assert.strictEqual(cs[1].dayType, 'pull'); assert.strictEqual(cs[1].trained, false); // 有记录未完成
  assert.strictEqual(cs[2].noRecord, true); assert.strictEqual(cs[2].dayType, 'rest'); // 课表是腿，但无记录
  assert.strictEqual(cs[3].noRecord, false); assert.strictEqual(cs[3].dayType, 'push'); // 今天按课表
  assert.ok(S.buildWeekCells(['push', 'pull', 'legs', 'push', 'pull', 'legs', 'push'], today, -1, {}).every((c) => c.noRecord));
  assert.strictEqual(S.PAST_NO_RECORD_LABEL, '未训练/休息');
  assert.ok(/c\.noRecord \? PAST_NO_RECORD_LABEL/.test(ts)); }
console.log('weekView.test ok');

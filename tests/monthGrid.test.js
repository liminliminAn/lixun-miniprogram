/** node tests/monthGrid.test.js — 计划页整月日历（tests/lib/monthGrid.js 由 utils/monthGrid.ts 经 tsc 生成） */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const M = require('./lib/monthGrid');
const read = (p) => fs.readFileSync(path.join(__dirname, '../miniprogram', p), 'utf8');
const today = '2026-10-29'; // 周四
const week = ['push', 'pull', 'legs', 'rest', 'push', 'pull', 'rest'];

// 6×7、周一起
const oct = M.monthDates(2026, 10);
assert.strictEqual(oct.length, 42);
assert.strictEqual(oct[0], '2026-09-28'); // 周一
assert.strictEqual(oct[3], '2026-10-01');
assert.strictEqual(oct[41], '2026-11-08');
assert.deepStrictEqual(M.MONTH_WEEKDAY_HEADER, ['一', '二', '三', '四', '五', '六', '日']);
assert.strictEqual(M.monthTitle(2026, 10), '2026年10月');
// 月初是周一：首格即 1 号
assert.strictEqual(M.monthDates(2026, 6)[0], '2026-06-01');
// 跨月、跨年
assert.deepStrictEqual(M.shiftMonth(today, 2), { year: 2026, month: 12 });
assert.deepStrictEqual(M.shiftMonth(today, 3), { year: 2027, month: 1 });
assert.deepStrictEqual(M.shiftMonth(today, -10), { year: 2025, month: 12 });
const jan = M.monthDates(2027, 1);
assert.strictEqual(jan[0], '2026-12-28');
assert.strictEqual(jan[4], '2027-01-01');
assert.ok(M.buildMonthCells(2027, 1, today, week, {}).filter((c) => c.inMonth).length === 31);

const sessions = {
  '2026-10-26': { dayType: 'push', completedAt: '2026-10-26T12:00:00Z', exercises: [] },
  '2026-10-27': { dayType: 'legs', completedAt: null, exercises: [{ exerciseId: 'sq', sets: [{ done: true }] }] },
  '2026-10-28': { dayType: 'legs', completedAt: null, exercises: [{ exerciseId: 'sq', sets: [{}] }] }, // 空草稿
};
const cells = M.buildMonthCells(2026, 10, today, week, sessions);
const at = (d) => cells.find((c) => c.date === d);
assert.strictEqual(cells.length, 42);
assert.deepStrictEqual(cells.filter((c) => c.isToday).map((c) => c.date), [today]);
assert.strictEqual(at('2026-09-30').inMonth, false);
// 过去：只显示记录
assert.strictEqual(at('2026-10-26').label, '✓已练');
assert.strictEqual(at('2026-10-27').label, '未完成'); // §3.5-5 开练未完成
assert.strictEqual(at('2026-10-27').dayType, 'legs'); // 保留实际记录类型（弹窗用），不是课表的拉
assert.strictEqual(at('2026-10-27').tappable, true);
assert.strictEqual(at('2026-10-28').label, '未训练/休息'); // §3.4-9 空草稿
assert.strictEqual(at('2026-10-21').label, '未训练/休息');
assert.strictEqual(at('2026-10-28').hasRecord, false);
// 今天及以后：生效课表
assert.strictEqual(at(today).label, '休');
assert.strictEqual(at('2026-10-30').label, '推');
assert.strictEqual(at('2026-11-03').label, '拉');
// 可改
assert.strictEqual(at('2026-10-27').editable, false);
assert.strictEqual(at(today).editable, true);
assert.strictEqual(at('2026-11-08').editable, true);
// 今天已开练 → 锁定且固定为记录类型
const started = { ...sessions, [today]: { dayType: 'pull', completedAt: null, warmup: { checked: ['a'] } } };
const t2 = M.buildMonthCells(2026, 10, today, week, started).find((c) => c.isToday);
assert.strictEqual(t2.editable, false);
assert.strictEqual(t2.label, '拉');
assert.strictEqual(M.editSheetTitle(2), '修改每周三');
assert.strictEqual(M.editSheetTitle(6), '修改每周日');

// 接线
const wxml = read('pages/plan/plan.wxml');
assert.ok(/展开 ▾/.test(wxml) && /收起 ▴/.test(wxml) && /onPrevMonth/.test(wxml) && /onNextMonth/.test(wxml) && /onPrevWeek/.test(wxml));
const ts = read('pages/plan/plan.ts');
assert.ok(/editSheetTitle/.test(ts) && /alertText: sheetTitle/.test(ts) && /handleTap/.test(ts));
const css = read('pages/plan/plan.wxss');
const mcss = css.slice(css.indexOf('.toggle'));
assert.ok(!/#[0-9a-fA-F]{3,6}|rgba?\(/.test(mcss), '月历只用主题变量');
assert.ok(/\.m-cell \{[^}]*min-height: 88rpx/.test(css));
console.log('monthGrid.test ok');

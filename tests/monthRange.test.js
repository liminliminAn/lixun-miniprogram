/** node tests/monthRange.test.js — §3.5-2 月历翻页范围：首次使用月 ~ 下个月 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const M = require('./lib/monthGrid');
const read = (p) => fs.readFileSync(path.join(__dirname, '../miniprogram', p), 'utf8');
const today = '2026-10-29';
// 首次使用：档案创建与最早会话取较早者；本地日期
assert.strictEqual(M.firstUseDate(new Date(2026, 7, 15, 10).toISOString(), ['2026-09-01'], today), '2026-08-15');
assert.strictEqual(M.firstUseDate(new Date(2026, 9, 1, 10).toISOString(), ['2026-10-20', '2026-06-03'], today), '2026-06-03');
assert.strictEqual(M.firstUseDate(null, [], today), today);
assert.strictEqual(M.firstUseDate('bad', ['x'], today), today);
// 范围
assert.deepStrictEqual(M.monthOffsetRange(today, '2026-08-15'), { min: -2, max: 1 });
assert.deepStrictEqual(M.monthOffsetRange(today, today), { min: 0, max: 1 });
assert.deepStrictEqual(M.monthOffsetRange('2027-01-05', '2026-11-30'), { min: -2, max: 1 }); // 跨年
const r = { min: -2, max: 1 };
assert.strictEqual(M.clampMonthOffset(-5, r), -2);
assert.strictEqual(M.clampMonthOffset(3, r), 1);
assert.strictEqual(M.clampMonthOffset(-1, r), -1);
assert.deepStrictEqual(M.shiftMonth('2026-12-10', 1), { year: 2027, month: 1 });
// 接线：到边界禁用 ‹ ›
const ts = read('pages/plan/plan.ts');
assert.ok(/onPrevMonth\(\) \{\s*if \(this\.data\.monthOffset <= this\.data\.monthMin\) return;/.test(ts));
assert.ok(/onNextMonth\(\) \{\s*if \(this\.data\.monthOffset >= this\.data\.monthMax\) return;/.test(ts));
assert.ok(/firstUseDate\(profile \? profile\.createdAt : null, Object\.keys\(sessions\)/.test(ts) && /clampMonthOffset/.test(ts));
const wxml = read('pages/plan/plan.wxml');
assert.ok(/monthOffset <= monthMin \? 'disabled'[^>]*onPrevMonth/.test(wxml) && /monthOffset >= monthMax \? 'disabled'[^>]*onNextMonth/.test(wxml));
console.log('monthRange.test ok');

/** node tests/monthTap.test.js — §3.5-3/4：非本月灰色日期、首次使用之前的日期不可点；首次使用前留空 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const M = require('./lib/monthGrid');
const today = '2026-10-29';
const week = ['push', 'pull', 'legs', 'rest', 'push', 'pull', 'rest'];
const cells = M.buildMonthCells(2026, 10, today, week, {}, '2026-10-10');
const at = (d) => cells.find((c) => c.date === d);
// 非本月
assert.strictEqual(at('2026-09-28').tappable, false);
assert.strictEqual(at('2026-11-02').tappable, false); // 未来但非本月
assert.strictEqual(at('2026-11-02').label, '推'); // 只显示
// 首次使用之前：留空、不可点
const pre = at('2026-10-09');
assert.strictEqual(pre.beforeFirstUse, true);
assert.strictEqual(pre.label, '');
assert.strictEqual(pre.noRecord, false);
assert.strictEqual(pre.tappable, false);
assert.strictEqual(pre.editable, false);
// 首次使用当天及之后正常
assert.strictEqual(at('2026-10-10').label, '未训练/休息');
assert.strictEqual(at('2026-10-10').tappable, true);
assert.strictEqual(at('2026-10-30').tappable, true);
assert.strictEqual(at('2026-10-30').editable, true); // 月历编辑暂保留
// 不传 firstUse 时兼容
assert.ok(M.buildMonthCells(2026, 10, today, week, {}).every((c) => !c.beforeFirstUse));
const ts = fs.readFileSync(path.join(__dirname, '../miniprogram/pages/plan/plan.ts'), 'utf8');
assert.ok(/onTapMonthDay[\s\S]*?if \(!cell \|\| !cell\.tappable\) return;/.test(ts));
assert.ok(/getEffectiveWeek\(\), sessions, firstUse\)/.test(ts));
console.log('monthTap.test ok');

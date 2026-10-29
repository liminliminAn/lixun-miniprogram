/** node tests/pastLabels.test.js — 过去无记录统一「休」（深灰）；已练「✓+类型」用类型色；未完成保留「未完成」；月历标签 ≥22rpx、不换行、本月不降透明度 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const S = require('./lib/schedule');
const M = require('./lib/monthGrid');
const read = (p) => fs.readFileSync(path.join(__dirname, '../miniprogram', p), 'utf8');
const today = '2026-10-29';
const week = ['push', 'pull', 'legs', 'rest', 'push', 'pull', 'rest'];
const sessions = {
  '2026-10-26': { dayType: 'push', completedAt: 'x', exercises: [] },
  '2026-10-27': { dayType: 'legs', completedAt: null, exercises: [{ exerciseId: 'sq', sets: [{ done: true }] }] },
};
assert.strictEqual(S.PAST_REST_LABEL, '休');
assert.strictEqual(S.PAST_NO_RECORD_LABEL, '未训练/休息'); // 弹窗保留全称
// 月历
const cells = M.buildMonthCells(2026, 10, today, week, sessions, '2026-10-01');
const at = (d) => cells.find((c) => c.date === d);
assert.strictEqual(at('2026-10-26').label, '✓推'); assert.strictEqual(at('2026-10-26').dayType, 'push');
assert.strictEqual(at('2026-10-27').label, '未完成');
assert.strictEqual(at('2026-10-28').label, '休'); assert.strictEqual(at('2026-10-28').dayType, null);
assert.strictEqual(M.monthDayPopup(at('2026-10-28'), undefined, (x) => x).content, '未训练/休息');
// 周视图（页面拼 label）
const ts = read('pages/plan/plan.ts');
assert.ok(/label: c\.noRecord \? PAST_REST_LABEL : c\.tense === 'past' && c\.trained \? `✓\$\{DAY_TYPE_LABEL\[c\.dayType\]\}` : DAY_TYPE_LABEL\[c\.dayType\]/.test(ts));
const wc = S.buildWeekCells(week, today, 0, sessions);
assert.deepStrictEqual([wc[0].trained, wc[0].dayType, wc[2].noRecord], [true, 'push', true]);
const wxml = read('pages/plan/plan.wxml');
assert.ok(/class="dt \{\{item\.noRecord \? 'rest' : item\.dayType\}\}"/.test(wxml)); // 休 → 深灰；✓推 → 推的颜色
assert.ok(/item\.hasRecord && !item\.trained\}\}">未完成<\/text>/.test(wxml) && !/✓ 已练/.test(wxml));
assert.ok(/class="m-type \{\{item\.tense === 'past' && item\.dayType && !item\.trained \? 'unfinished' : \(item\.dayType \|\| 'rest'\)\}\}"/.test(wxml));
// 样式
const css = read('pages/plan/plan.wxss');
const mt = (css.match(/\.m-type \{([^}]*)\}/) || [])[1];
assert.ok(mt && /white-space: nowrap/.test(mt) && !/opacity/.test(mt));
assert.ok(Number(mt.match(/font-size: (\d+)rpx/)[1]) >= 22);
assert.ok(/color: var\(--type-rest\)/.test(mt));
const opac = css.split('}').filter((r) => /opacity/.test(r)).map((r) => r.trim().split('{')[0].trim());
assert.deepStrictEqual(opac, [], 'P3-3：非本月格子不再降透明度，改用次要色');
assert.ok(!/--color-done/.test(read('app.wxss')));
console.log('pastLabels.test ok');

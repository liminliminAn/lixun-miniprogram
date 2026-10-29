/** node tests/monthPolish.test.js — 7f212d9 回归 P3：✓已练独立色、非本月 0.5、「未练」短标签、改天软提示用固定课表、去 rgba */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const M = require('./lib/monthGrid');
const S = require('./lib/schedule');
const read = (p) => fs.readFileSync(path.join(__dirname, '../miniprogram', p), 'utf8');
const css = read('pages/plan/plan.wxss');
const app = read('app.wxss');
const light = app.slice(app.indexOf('prefers-color-scheme: light'));
const dark = app.slice(0, app.indexOf('prefers-color-scheme: light'));
for (const v of ['done', 'success-soft', 'warning-soft']) { // 已不用，已删除
  assert.ok(!new RegExp(`--color-${v}:`).test(app), v + ' 应已删除'); continue;
  assert.ok(new RegExp(`--color-${v}:\\s*#[0-9A-Fa-f]{6}`).test(dark) && new RegExp(`--color-${v}:\\s*#[0-9A-Fa-f]{6}`).test(light), v + ' 亮暗都定义');
}
assert.ok(!/--color-done/.test(css));
assert.ok(!/\.m-type\.pull[^{]*\.m-type\.done|\.m-type\.done[^{]*\.m-type\.pull/.test(css), '拉与✓已练不共用颜色');
assert.ok(/\.m-cell\.out \.m-day \{ color: var\(--color-ink-secondary\); \}/.test(css));
assert.ok(!/rgba?\(|#[0-9a-fA-F]{3,6}\b/.test(css), 'plan.wxss 不含硬编码颜色');
// 「未练」只在月历格子；周视图保留全称
assert.strictEqual(M.MONTH_NO_RECORD_LABEL, '休');
const c = M.buildMonthCells(2026, 10, '2026-10-29', ['push', 'pull', 'legs', 'rest', 'push', 'pull', 'rest'], {}, '2026-10-01').find((x) => x.date === '2026-10-05');
assert.strictEqual(c.label, '休');
assert.strictEqual(S.PAST_NO_RECORD_LABEL, '未训练/休息');
const ts = read('pages/plan/plan.ts');
assert.ok(/c\.noRecord \? PAST_REST_LABEL/.test(ts));
// 改天后的软提示按固定今天的课表
assert.ok(/setDateOverride\(date, kind\);[\s\S]*?const tip = streakSoftTipDays\(pinnedDays\(\)\)/.test(ts));
assert.ok(!/streakSoftTip\(next\.week\)/.test(ts));
// 今天已开练为推、课表改今天以外某天：软提示按推计算
{ const pinned = S.weekWithTodayPinned(['rest', 'rest', 'rest', 'rest', 'legs', 'legs', 'legs'], 3, { dayType: 'push', warmup: { checked: ['a'] } });
  assert.strictEqual(S.streakSoftTip(pinned), S.STREAK_SOFT_TIP); }
console.log('monthPolish.test ok');

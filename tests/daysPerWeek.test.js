/** node tests/daysPerWeek.test.js — 每周 3/4/5 练重新生成默认课表（tests/lib/templates.js 由 constants/templates.ts 经 tsc 生成） */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const T = require('./lib/templates');
const S = require('./lib/schedule');
const read = (p) => fs.readFileSync(path.join(__dirname, '../miniprogram', p), 'utf8');

assert.deepStrictEqual(T.DAYS_PER_WEEK_OPTIONS, [3, 4, 5]);
for (const n of [3, 4, 5]) {
  const p = T.buildWeekPlan(n);
  assert.strictEqual(p.daysPerWeek, n);
  assert.strictEqual(p.week.length, 7);
  assert.strictEqual(p.week.filter((d) => d !== 'rest').length, n, n + ' 练训练日数');
  for (const k of ['push', 'pull', 'legs']) assert.ok(p.week.includes(k), n + ' 练含' + k);
  assert.ok(S.isValidWeek(p.week));
}
assert.deepStrictEqual(T.buildWeekPlan(3).week, ['push', 'rest', 'pull', 'rest', 'legs', 'rest', 'rest']);
assert.deepStrictEqual(T.buildWeekPlan(4).week, ['push', 'pull', 'legs', 'rest', 'pull', 'rest', 'rest']);
assert.deepStrictEqual(T.buildWeekPlan(5).week, ['push', 'pull', 'legs', 'rest', 'push', 'pull', 'rest']);
const a = T.buildWeekPlan(4); a.week[0] = 'rest';
assert.strictEqual(T.buildWeekPlan(4).week[0], 'push'); // 模板不被改写
assert.ok(T.isDaysPerWeek(3) && !T.isDaysPerWeek(6) && !T.isDaysPerWeek('4'));

// 覆盖语义：确认=清自定义 → 生效新默认；取消=保留自定义 → 仍生效自定义
const custom = S.setDay(T.buildWeekPlan(4).week, 6, 'legs');
assert.deepStrictEqual(S.effectiveWeek(T.buildWeekPlan(3).week, null), T.buildWeekPlan(3).week);
assert.deepStrictEqual(S.effectiveWeek(T.buildWeekPlan(3).week, custom), custom.week);

// 接线
const prof = read('services/profile.ts');
assert.ok(/export function changeDaysPerWeek/.test(prof));
assert.ok(/KEYS\.profile, \{ \.\.\.p, daysPerWeek: n/.test(prof) && /KEYS\.plan, buildWeekPlan\(n\)/.test(prof) && /if \(overwriteCustom\) clearCustomSchedule\(\)/.test(prof));
const me = read('pages/me/me.ts');
assert.ok(/onTapDays[\s\S]*showActionSheet[\s\S]*hasCustomSchedule\(\)[\s\S]*showModal[\s\S]*apply\(!!r\.confirm\)/.test(me));
assert.ok(/bindtap="onTapDays"/.test(read('pages/me/me.wxml')));
console.log('daysPerWeek.test ok');

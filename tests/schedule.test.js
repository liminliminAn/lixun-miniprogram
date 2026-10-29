/** node tests/schedule.test.js — tests/lib/schedule.js 由 miniprogram/utils/schedule.ts 经 tsc 生成 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const S = require('./lib/schedule');
const root = path.join(__dirname, '../miniprogram');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const def4 = ['push', 'pull', 'legs', 'rest', 'pull', 'rest', 'rest'];
// 无自定义 → 默认
assert.deepStrictEqual(S.effectiveWeek(def4, null), def4);
// 自定义覆盖默认
const c = S.setDay(def4, 3, 'push', new Date('2026-10-29T00:00:00Z'));
assert.deepStrictEqual(c.week, ['push', 'pull', 'legs', 'push', 'pull', 'rest', 'rest']);
assert.deepStrictEqual(S.effectiveWeek(def4, c), c.week);
assert.deepStrictEqual(def4[3], 'rest'); // 不改默认
assert.ok(S.isCustomized(c));
// 恢复默认（清除自定义）→ 回到默认
assert.deepStrictEqual(S.effectiveWeek(def4, null), def4);
// 非法自定义被忽略
assert.deepStrictEqual(S.effectiveWeek(def4, { week: ['push'] }), def4);
assert.deepStrictEqual(S.effectiveWeek(def4, { week: [1, 2, 3, 4, 5, 6, 7] }), def4);
assert.deepStrictEqual(S.setDay(def4, 9, 'push').week, def4);
assert.deepStrictEqual(S.setDay(def4, 0, 'xx').week, def4);
assert.deepStrictEqual(S.DAY_KIND_SHEET, ['推', '拉', '腿', '休']);

// 接线：新 key、今日走生效课表、计划页 ActionSheet + 恢复默认
assert.ok(/customSchedule:\s*'lixun:v1:customSchedule'/.test(read('services/storage.ts')));
assert.ok(/getEffectiveWeek\(\)\[mondayBasedIndex/.test(read('services/workout.ts')));
const planTs = read('pages/plan/plan.ts');
assert.ok(/wx\.showActionSheet/.test(planTs) && /clearCustomSchedule\(\)/.test(planTs) && /getEffectiveWeek\(\)/.test(planTs));
assert.ok(!/plan\.week/.test(planTs));
assert.ok(/恢复默认/.test(read('pages/plan/plan.wxml')) && /bindtap="onTapDay"/.test(read('pages/plan/plan.wxml')));
console.log('schedule.test ok');

// P2-2：重做问卷生成新档案/课表时清除自定义课表
{ const prof = read('services/profile.ts');
  const body = prof.slice(prof.indexOf('export function saveOnboarding'), prof.indexOf('export function getPlan'));
  assert.ok(/storage\.set\(KEYS\.plan, buildWeekPlan/.test(body) && /storage\.remove\(KEYS\.customSchedule\)/.test(body), 'saveOnboarding 需清 customSchedule'); }
console.log('schedule.test P2-2 ok');

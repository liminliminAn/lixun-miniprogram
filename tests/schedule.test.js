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
assert.ok(/pinType\(resolveDay\(d\), getSession\(d\)\)/.test(read('services/workout.ts')));
const planTs = read('pages/plan/plan.ts');
assert.ok(/wx\.showActionSheet/.test(planTs) && /clearCustomSchedule\(\);\s*clearDateOverrides\(\);/.test(planTs) && /getEffectiveWeek\(\)/.test(planTs));
assert.ok(!/plan\.week/.test(planTs));
assert.ok(/恢复默认/.test(read('pages/plan/plan.wxml')) && /bindtap="onTapDay"/.test(read('pages/plan/plan.wxml')));
console.log('schedule.test ok');

// §3.4-3（取代 P2-2 自动清除）：重做问卷不自动清自定义课表；有则弹窗「重新排课 / 保留我的课表」
{ const prof = read('services/profile.ts');
  const body = prof.slice(prof.indexOf('export function saveOnboarding'), prof.indexOf('export function getPlan'));
  assert.ok(/storage\.set\(KEYS\.plan, buildWeekPlan/.test(body));
  assert.ok(!/customSchedule/.test(body.replace(/\/\/.*$/gm, '')), 'saveOnboarding 不应自动清自定义课表');
  const ob = read('pages/onboarding/onboarding.ts');
  assert.ok(/if \(needsRescheduleConfirm\(\)\)[\s\S]*用新结果重新排课？[\s\S]*confirmText: '重新排课'[\s\S]*cancelText: '保留我的课表'[\s\S]*if \(r\.confirm\) \{\s*clearCustomSchedule\(\);/.test(ob));
  assert.ok(!/\$\{profile\.crowd\}/.test(ob), '问卷 toast 不应显示英文人群枚举'); }
console.log('schedule.test §3.4-3 ok');
// P3：自定义生效时标题旁显示「自定义」小标签
{ const wxml = read('pages/plan/plan.wxml');
  assert.ok(/本周课表（\{\{daysPerWeek\}\} 练）<text class="tag-custom" wx:if="\{\{customized\}\}">自定义<\/text>/.test(wxml));
  assert.ok(/\.tag-custom\s*\{/.test(read('pages/plan/plan.wxss')));
  assert.ok(/const restorable = hasCustomSchedule\(\)[\s\S]*customized: restorable/.test(read('pages/plan/plan.ts'))); }
console.log('schedule.test tag ok');

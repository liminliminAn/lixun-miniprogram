/** node tests/schedule.test.js — 课表：日期覆盖 → 问卷默认课表（周模板层已移除）；tests/lib/schedule.js 由 miniprogram/utils/schedule.ts 经 tsc 生成 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const S = require('./lib/schedule');
const root = path.join(__dirname, '../miniprogram');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const def4 = ['push', 'pull', 'legs', 'rest', 'pull', 'rest', 'rest'];
assert.deepStrictEqual(S.planWeek(def4), def4);
assert.notStrictEqual(S.planWeek(def4), def4, '返回副本');
assert.deepStrictEqual(S.planWeek(null), ['rest', 'rest', 'rest', 'rest', 'rest', 'rest', 'rest']);
assert.deepStrictEqual(S.planWeek(['push']), S.planWeek(null));
assert.deepStrictEqual(S.DAY_KIND_SHEET, ['推', '拉', '腿', '休']);
// 模板层代码已删除
for (const fn of ['effectiveWeek', 'setDay', 'isCustomized', 'maxConsecutiveTraining', 'streakSoftTip', 'pinnedResolvedWeek']) assert.strictEqual(S[fn], undefined, `${fn} 应已移除`);
const src = fs.readdirSync(root, { recursive: true }).filter((f) => /\.(ts|wxml)$/.test(f)).map((f) => [f, read(f)]);
for (const [f, t] of src) {
  if (f.endsWith('storage.ts') || f.endsWith('profile.ts') || f.endsWith('app.ts')) continue;
  assert.ok(!/customSchedule|CustomSchedule|getEffectiveWeek/.test(t), `${f} 不应再引用周模板`);
}

// 存储：key 移出 KEYS，仅保留迁移用遗留常量；启动时删除
const st = read('services/storage.ts');
assert.ok(!/^\s*customSchedule:/m.test(st));
assert.ok(/LEGACY_CUSTOM_SCHEDULE_KEY = 'lixun:v1:customSchedule'/.test(st));
const prof = read('services/profile.ts');
assert.ok(/export function migrateRemoveCustomSchedule\(\): void \{\s*storage\.remove\(LEGACY_CUSTOM_SCHEDULE_KEY\);\s*\}/.test(prof));
assert.ok(/export function getPlanWeek\(\)[\s\S]*?planWeek\(plan \? plan\.week : null\)/.test(prof));
assert.ok(/resolveDayType\(date, getPlanWeek\(\), getDateOverrides\(\)\)/.test(prof));
const app = read('app.ts');
assert.ok(/storage\.ensureDefaults\(\);[\s\S]*?migrateRemoveCustomSchedule\(\);[\s\S]*?launchRedirect/.test(app), '首次渲染前迁移');
// 迁移行为：模拟 storage
{ const store = { 'lixun:v1:customSchedule': { week: [] }, 'lixun:v1:dateOverrides': { '2026-10-30': 'push' } };
  const storage = { remove: (k) => delete store[k] };
  const body = prof.match(/export function migrateRemoveCustomSchedule\(\): void \{([\s\S]*?)\n\}/)[1];
  new Function('storage', 'LEGACY_CUSTOM_SCHEDULE_KEY', body)(storage, 'lixun:v1:customSchedule');
  assert.deepStrictEqual(Object.keys(store), ['lixun:v1:dateOverrides'], '只删模板，保留按日修改'); }

// 接线：今日走解析；计划页 ActionSheet + 恢复默认
assert.ok(/pinType\(resolveDay\(d\), getSession\(d\)\)/.test(read('services/workout.ts')));
const planTs = read('pages/plan/plan.ts');
assert.ok(/wx\.showActionSheet/.test(planTs) && /if \(!r\.confirm\) return;\s*clearDateOverrides\(\);/.test(planTs) && /getPlanWeek\(\)/.test(planTs));
assert.ok(!/plan\.week/.test(planTs));
assert.ok(/恢复默认/.test(read('pages/plan/plan.wxml')) && /bindtap="onTapDay"/.test(read('pages/plan/plan.wxml')));
console.log('schedule.test ok');

// §3.4-3：重做问卷不自动清覆盖；今天起有按日修改则弹窗「重新排课 / 保留我的课表（保留按日修改）」
{ const body = prof.slice(prof.indexOf('export function saveOnboarding'), prof.indexOf('export function getPlan'));
  assert.ok(/storage\.set\(KEYS\.plan, buildWeekPlan/.test(body));
  assert.ok(!/dateOverrides|clearOverridesFrom/.test(body.replace(/\/\/.*$/gm, '')), 'saveOnboarding 不应自动清按日修改');
  const ob = read('pages/onboarding/onboarding.ts');
  assert.ok(/if \(needsRescheduleConfirm\(\)\)[\s\S]*用新结果重新排课？[\s\S]*confirmText: '重新排课'[\s\S]*cancelText: '保留我的课表'[\s\S]*if \(r\.confirm\) clearOverridesFrom\(\);/.test(ob));
  assert.ok(!/\$\{profile\.crowd\}/.test(ob), '问卷 toast 不应显示英文人群枚举'); }
console.log('schedule.test §3.4-3 ok');
// 「自定义」小标签与恢复默认：只看今天起的按日修改
{ const wxml = read('pages/plan/plan.wxml');
  assert.ok(/本周课表（\{\{daysPerWeek\}\} 练）<text class="tag-custom" wx:if="\{\{customized\}\}">自定义<\/text>/.test(wxml));
  assert.ok(/\.tag-custom\s*\{/.test(read('pages/plan/plan.wxss')));
  assert.ok(/const restorable = hasActiveOverrides\(today\);[\s\S]*customized: restorable,\s*restorable,/.test(planTs)); }
console.log('schedule.test tag ok');

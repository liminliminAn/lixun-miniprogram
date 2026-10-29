/** node tests/dateOverrides.test.js — lixun:v1:dateOverrides：日期覆盖 → 自定义模板 → 默认模板 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const S = require('./lib/schedule');
const M = require('./lib/monthGrid');
const read = (p) => fs.readFileSync(path.join(__dirname, '../miniprogram', p), 'utf8');
const today = '2026-10-29'; // 周四
const def = ['push', 'rest', 'pull', 'rest', 'legs', 'rest', 'rest'];
const custom = { week: ['push', 'pull', 'legs', 'rest', 'push', 'pull', 'rest'], updatedAt: 'x' };
const tmpl = S.effectiveWeek(def, custom);
const ov = { '2026-10-30': 'legs', '2026-11-05': 'push', '2026-10-20': 'pull' };
// 解析顺序
assert.strictEqual(S.resolveDayType('2026-10-30', tmpl, ov), 'legs'); // 覆盖
assert.strictEqual(S.resolveDayType('2026-10-31', tmpl, ov), 'pull'); // 自定义模板（周六）
assert.strictEqual(S.resolveDayType('2026-10-31', S.effectiveWeek(def, null), ov), 'rest'); // 默认模板
assert.strictEqual(S.resolveDayType('2026-11-05', tmpl, ov), 'push');
assert.strictEqual(S.resolveDayType('2026-11-06', tmpl, ov), 'push'); // 下周五不受 10/30 影响
assert.strictEqual(S.resolveDayType('2026-10-30', tmpl, { '2026-10-30': 'bogus' }), 'push');
// 写入只影响这一天，过去日不写、顺带清理过去覆盖
const w = S.withOverride(ov, '2026-11-01', 'rest', today);
assert.deepStrictEqual(w, { '2026-10-30': 'legs', '2026-11-05': 'push', '2026-11-01': 'rest' });
assert.deepStrictEqual(S.withOverride({}, '2026-10-28', 'push', today), {});
assert.deepStrictEqual(S.pruneOverrides(ov, today), { '2026-10-30': 'legs', '2026-11-05': 'push' });
assert.deepStrictEqual(S.pruneOverrides(null, today), {});
assert.strictEqual(S.overrideSheetTitle('2026-11-05'), '修改 11/5');
assert.strictEqual(S.hasOverrideIn(ov, S.weekDates(today, 0)), true);
assert.strictEqual(S.hasOverrideIn({ '2026-11-05': 'push' }, S.weekDates(today, 0)), false);
// 周视图 / 月历都用解析结果
assert.strictEqual(S.buildWeekCells(tmpl, today, 0, {}, ov)[4].dayType, 'legs');
assert.strictEqual(M.buildMonthCells(2026, 11, today, tmpl, {}, '2026-10-01', ov).find((c) => c.date === '2026-11-05').label, '推');
// 今天覆盖：未开练按覆盖；已开练固定为记录类型
assert.strictEqual(S.buildWeekCells(tmpl, today, 0, {}, { [today]: 'push' })[3].dayType, 'push');
const started = { [today]: { dayType: 'legs', warmup: { checked: ['a'] } } };
assert.strictEqual(S.buildWeekCells(tmpl, today, 0, started, { [today]: 'push' })[3].dayType, 'legs');
assert.strictEqual(S.buildWeekCells(tmpl, today, 0, started, { [today]: 'push' })[3].editable, false);
// 过去日按记录，覆盖不影响
assert.strictEqual(S.buildWeekCells(tmpl, today, 0, {}, { '2026-10-27': 'push' })[1].noRecord, true);
// 连练提示用解析 + 固定
assert.deepStrictEqual(S.pinnedResolvedWeek(tmpl, today, { '2026-10-29': 'pull', '2026-11-01': 'legs' }, null), ['push', 'pull', 'legs', 'pull', 'push', 'pull', 'legs']);
assert.strictEqual(S.streakSoftTip(S.pinnedResolvedWeek(tmpl, today, { '2026-10-29': 'pull' }, null)), S.STREAK_SOFT_TIP);
assert.deepStrictEqual(S.pinnedResolvedWeek(tmpl, today, { [today]: 'pull' }, started[today])[3], 'legs');
// 接线
assert.ok(/dateOverrides:\s*'lixun:v1:dateOverrides'/.test(read('services/storage.ts')));
const prof = read('services/profile.ts');
assert.ok(/resolveDayType\(date, getEffectiveWeek\(\), getDateOverrides\(\)\)/.test(prof));
assert.ok(/withOverride\(getDateOverrides\(\), date, kind, today\)/.test(prof));
const cdp = prof.slice(prof.indexOf('export function changeDaysPerWeek'));
assert.ok(!/clearDateOverrides|dateOverrides/.test(cdp), '改天数保留日期覆盖');
assert.ok(!/clearDateOverrides/.test(read('pages/onboarding/onboarding.ts')) && !/clearDateOverrides/.test(prof.slice(prof.indexOf('export function saveOnboarding'), prof.indexOf('export function getPlan'))), '重做问卷保留日期覆盖');
assert.ok(/pinType\(resolveDay\(d\), getSession\(d\)\)/.test(read('services/workout.ts'))); // 今日页 / 开练
const plan = read('pages/plan/plan.ts');
assert.ok(/onRestoreDefault\(\) \{[\s\S]*?clearCustomSchedule\(\);\s*clearDateOverrides\(\);/.test(plan));
assert.ok(/const restorable = hasCustomSchedule\(\) \|\| hasActiveOverrides\(today\);[\s\S]*customized: restorable,\s*restorable,/.test(plan), '自定义标签与恢复默认同口径');
assert.ok(/buildWeekCells\(getEffectiveWeek\(\), today, offset, getSessions\(\) as any, getDateOverrides\(\)\)/.test(plan));
console.log('dateOverrides.test ok');

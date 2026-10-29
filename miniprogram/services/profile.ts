import { storage, KEYS, LEGACY_CUSTOM_SCHEDULE_KEY } from './storage';
import { keepCreatedAt } from '../utils/persist';
import { classify } from '../utils/classify';
import { buildWeekPlan, isDaysPerWeek } from '../constants/templates';
import { planWeek, DateOverrides, resolveDayType, withOverride, pruneOverrides, dropOverridesFrom } from '../utils/schedule';
import { formatDate } from '../utils/date';

export { classify };

export function getProfile(): UserProfile | null {
  return storage.get<UserProfile | null>(KEYS.profile, null);
}

export function isOnboardingDone(): boolean {
  const p = getProfile();
  return !!(p && p.onboardingDone);
}

export function saveOnboarding(input: ClassifyInput): UserProfile {
  const now = new Date().toISOString();
  const crowd = classify(input);
  const profile: UserProfile = {
    ...input,
    crowd,
    onboardingDone: true,
    // 重做问卷不改 createdAt（首次使用日以此为准）
    createdAt: keepCreatedAt(getProfile(), now),
    updatedAt: now,
  };
  storage.set(KEYS.profile, profile);
  storage.set(KEYS.plan, buildWeekPlan(input.daysPerWeek));
  // §3.4-3：按日修改不自动清除，由问卷页询问用户
  storage.ensureDefaults();
  return profile;
}

export function getPlan(): WeekPlan | null {
  return storage.get<WeekPlan | null>(KEYS.plan, null);
}

export function getPrefs(): Prefs {
  return { ...storage.DEFAULT_PREFS, ...storage.get<Prefs>(KEYS.prefs, { ...storage.DEFAULT_PREFS }) };
}

export function setPrefs(patch: Partial<Prefs>): void {
  storage.set(KEYS.prefs, { ...getPrefs(), ...patch });
}

/** 迁移：周模板层已移除，删除遗留的 lixun:v1:customSchedule（首次启动执行，幂等） */
export function migrateRemoveCustomSchedule(): void {
  storage.remove(LEGACY_CUSTOM_SCHEDULE_KEY);
}

export function getDateOverrides(): DateOverrides {
  return storage.get<DateOverrides>(KEYS.dateOverrides, {}) || {};
}

/** 只改这一天（周视图、月历共用）；同时清理过去日期的覆盖 */
export function setDateOverride(date: string, kind: DayType, today: string = formatDate()): void {
  storage.set(KEYS.dateOverrides, withOverride(getDateOverrides(), date, kind, today));
}

export function clearDateOverrides(): void {
  storage.remove(KEYS.dateOverrides);
}

/** 今天及以后的覆盖个数 */
export function countActiveOverrides(today: string = formatDate()): number {
  return Object.keys(pruneOverrides(getDateOverrides(), today)).length;
}

/** 清除今天及以后的覆盖 */
export function clearOverridesFrom(today: string = formatDate()): void {
  storage.set(KEYS.dateOverrides, dropOverridesFrom(getDateOverrides(), today));
}

/** 需要重排确认：今天及以后有覆盖 */
export function needsRescheduleConfirm(today: string = formatDate()): boolean {
  return countActiveOverrides(today) > 0;
}

/** 今天及以后是否还有覆盖 */
export function hasActiveOverrides(today: string = formatDate()): boolean {
  return Object.keys(pruneOverrides(getDateOverrides(), today)).length > 0;
}

/** 某天生效类型：日期覆盖 → 问卷默认课表 */
export function resolveDay(date: string): DayType {
  return resolveDayType(date, getPlanWeek(), getDateOverrides());
}

/** 问卷生成的默认周课表 */
export function getPlanWeek(): DayType[] {
  const plan = getPlan();
  return planWeek(plan ? plan.week : null);
}

/**
 * 改每周练几天：写回档案并重新生成默认课表。
 * clearOverrides=true 时同时清除今天起的按日修改。
 */
export function changeDaysPerWeek(n: DaysPerWeek, clearOverrides: boolean): boolean {
  if (!isDaysPerWeek(n)) return false;
  const p = getProfile();
  if (!p) return false;
  storage.set(KEYS.profile, { ...p, daysPerWeek: n, updatedAt: new Date().toISOString() });
  storage.set(KEYS.plan, buildWeekPlan(n));
  if (clearOverrides) clearOverridesFrom();
  return true;
}

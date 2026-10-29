import { storage, KEYS } from './storage';
import { keepCreatedAt } from '../utils/persist';
import { classify } from '../utils/classify';
import { buildWeekPlan, isDaysPerWeek } from '../constants/templates';
import { effectiveWeek, isCustomized, CustomSchedule, DateOverrides, resolveDayType, withOverride, pruneOverrides, dropOverridesFrom } from '../utils/schedule';
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
  // §3.4-3：自定义课表不自动清除，由问卷页询问用户
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

export function getCustomSchedule(): CustomSchedule | null {
  return storage.get<CustomSchedule | null>(KEYS.customSchedule, null);
}

export function saveCustomSchedule(c: CustomSchedule): void {
  storage.set(KEYS.customSchedule, c);
}

export function clearCustomSchedule(): void {
  storage.remove(KEYS.customSchedule);
}

export function hasCustomSchedule(): boolean {
  return isCustomized(getCustomSchedule());
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

/** 需要重排确认：有自定义周模板，或今天及以后有覆盖 */
export function needsRescheduleConfirm(today: string = formatDate()): boolean {
  return hasCustomSchedule() || countActiveOverrides(today) > 0;
}

/** 今天及以后是否还有覆盖 */
export function hasActiveOverrides(today: string = formatDate()): boolean {
  return Object.keys(pruneOverrides(getDateOverrides(), today)).length > 0;
}

/** 某天生效类型：日期覆盖 → 自定义周模板 → 默认模板 */
export function resolveDay(date: string): DayType {
  return resolveDayType(date, getEffectiveWeek(), getDateOverrides());
}

/** 所有读周课表的地方统一走这里：自定义优先 */
export function getEffectiveWeek(): DayType[] {
  const plan = getPlan();
  return effectiveWeek(plan ? plan.week : null, getCustomSchedule());
}

/**
 * 改每周练几天：写回档案并重新生成默认课表。
 * overwriteCustom=true 时同时清除自定义课表；false 保留自定义（仍优先生效）。
 */
export function changeDaysPerWeek(n: DaysPerWeek, overwriteCustom: boolean): boolean {
  if (!isDaysPerWeek(n)) return false;
  const p = getProfile();
  if (!p) return false;
  storage.set(KEYS.profile, { ...p, daysPerWeek: n, updatedAt: new Date().toISOString() });
  storage.set(KEYS.plan, buildWeekPlan(n));
  if (overwriteCustom) {
    clearCustomSchedule();
    clearOverridesFrom();
  }
  return true;
}

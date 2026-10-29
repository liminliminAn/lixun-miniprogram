import { storage, KEYS } from './storage';
import { classify } from '../utils/classify';
import { buildWeekPlan, isDaysPerWeek } from '../constants/templates';
import { effectiveWeek, isCustomized, CustomSchedule } from '../utils/schedule';

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
    createdAt: now,
    updatedAt: now,
  };
  storage.set(KEYS.profile, profile);
  storage.set(KEYS.plan, buildWeekPlan(input.daysPerWeek));
  // P2-2：重做问卷 → 新档案/新默认课表，旧的自定义课表作废
  storage.remove(KEYS.customSchedule);
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
  if (overwriteCustom) clearCustomSchedule();
  return true;
}

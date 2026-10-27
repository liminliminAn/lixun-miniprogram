import { storage, KEYS } from './storage';
import { classify } from '../utils/classify';
import { buildWeekPlan } from '../constants/templates';

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
  storage.ensureDefaults();
  return profile;
}

export function getPlan(): WeekPlan | null {
  return storage.get<WeekPlan | null>(KEYS.plan, null);
}

export function getPrefs(): Prefs {
  return storage.get<Prefs>(KEYS.prefs, { ...storage.DEFAULT_PREFS });
}

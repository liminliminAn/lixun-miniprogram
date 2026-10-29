/** Storage key 命名空间（收敛后） */
export const KEYS = {
  profile: 'lixun:v1:profile',
  plan: 'lixun:v1:plan',
  sessions: 'lixun:v1:sessions',
  lastSets: 'lixun:v1:lastSets',
  bodyweight: 'lixun:v1:bodyweight',
  prefs: 'lixun:v1:prefs',
  /** IT2-02 每日蛋白达标打卡 { [YYYY-MM-DD]: { proteinHit } } */
  dietLog: 'lixun:v1:dietLog',
  /** IT2-07 本地登录资料 LocalUser */
  user: 'lixun:v1:user',
  /** 用户自定义本周课表 CustomSchedule；存在时优先于 plan.week */
  customSchedule: 'lixun:v1:customSchedule',
  /** 按日期覆盖 { [YYYY-MM-DD]: DayType }；优先于周模板 */
  dateOverrides: 'lixun:v1:dateOverrides',
} as const;

export type StorageKey = (typeof KEYS)[keyof typeof KEYS];

const DEFAULT_PREFS: Prefs = {
  restSoftWarnDays: 3,
  showWarmup: true,
};

export function get<T>(key: string, fallback: T): T {
  try {
    const raw = wx.getStorageSync(key);
    if (raw === '' || raw === undefined || raw === null) return fallback;
    return raw as T;
  } catch {
    return fallback;
  }
}

export function set(key: string, value: unknown): void {
  wx.setStorageSync(key, value);
}

export function remove(key: string): void {
  wx.removeStorageSync(key);
}

export function ensureDefaults(): void {
  const prefs = get<Prefs | null>(KEYS.prefs, null);
  if (!prefs) {
    set(KEYS.prefs, { ...DEFAULT_PREFS });
  }
  if (!get<SessionsStore | null>(KEYS.sessions, null)) {
    set(KEYS.sessions, {} as SessionsStore);
  }
  if (!get<LastSetsStore | null>(KEYS.lastSets, null)) {
    set(KEYS.lastSets, {} as LastSetsStore);
  }
  if (!get<BodyWeightEntry[] | null>(KEYS.bodyweight, null)) {
    set(KEYS.bodyweight, [] as BodyWeightEntry[]);
  }
}

export const storage = {
  KEYS,
  get,
  set,
  remove,
  ensureDefaults,
  DEFAULT_PREFS,
};

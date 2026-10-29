/** 本周课表：自定义优先于默认（纯函数，便于单测） */
export type DayKind = 'push' | 'pull' | 'legs' | 'rest';
export const DAY_KINDS: DayKind[] = ['push', 'pull', 'legs', 'rest'];
export const DAY_KIND_SHEET = ['推', '拉', '腿', '休'];

export interface CustomSchedule {
  week: DayKind[];
  updatedAt: string;
}

export function isValidWeek(week: any): week is DayKind[] {
  return Array.isArray(week) && week.length === 7 && week.every((d) => DAY_KINDS.indexOf(d) >= 0);
}

/** 生效课表：自定义合法则用自定义，否则用默认 plan.week */
export function effectiveWeek(
  defaultWeek: DayKind[] | null | undefined,
  custom: CustomSchedule | null | undefined,
): DayKind[] {
  if (custom && isValidWeek(custom.week)) return [...custom.week];
  if (isValidWeek(defaultWeek)) return [...defaultWeek];
  return ['rest', 'rest', 'rest', 'rest', 'rest', 'rest', 'rest'];
}

/** 改某一天，返回新的自定义课表（以当前生效课表为底） */
export function setDay(
  base: DayKind[],
  idx: number,
  kind: DayKind,
  now: Date = new Date(),
): CustomSchedule {
  const week = [...base];
  if (idx >= 0 && idx < 7 && DAY_KINDS.indexOf(kind) >= 0) week[idx] = kind;
  return { week, updatedAt: now.toISOString() };
}

export function isCustomized(custom: CustomSchedule | null | undefined): boolean {
  return !!(custom && isValidWeek(custom.week));
}

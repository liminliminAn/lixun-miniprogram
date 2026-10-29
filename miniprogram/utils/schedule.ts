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

/* ---------- 周视图：日期、翻周、完成标记、过去日禁改 ---------- */
const pad = (n: number) => `${n}`.padStart(2, '0');
function parse(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function fmt(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** 不能翻到本周之后：offset 只允许 ≤ 0 */
export function clampWeekOffset(offset: number): number {
  const n = Math.trunc(Number(offset) || 0);
  return n > 0 ? 0 : n;
}

/** today 所在周（周一起）偏移 offset 周后的 7 天 YYYY-MM-DD */
export function weekDates(today: string, offset: number = 0): string[] {
  const t = parse(today);
  const js = t.getDay();
  const mon = new Date(t.getFullYear(), t.getMonth(), t.getDate() - (js === 0 ? 6 : js - 1) + clampWeekOffset(offset) * 7);
  return Array.from({ length: 7 }, (_, i) => fmt(new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + i)));
}

/** M/D，如 10/27 */
export function shortDate(date: string): string {
  const [, m, d] = date.split('-').map(Number);
  return `${m}/${d}`;
}

export type DayTense = 'past' | 'today' | 'future';
export function dayTense(date: string, today: string): DayTense {
  return date < today ? 'past' : date === today ? 'today' : 'future';
}

/** 过去日不能改课表类型；今天及以后可以 */
export function canEditDay(date: string, today: string): boolean {
  return dayTense(date, today) !== 'past';
}

export interface SessionLite {
  dayType?: DayKind;
  completedAt?: string | null;
  exercises?: Array<{ exerciseId: string; sets: Array<{ weight?: number; reps?: number; done?: boolean }> }>;
}

/** 只认带 completedAt 的记录 */
export function isTrained(s: SessionLite | null | undefined): boolean {
  return !!(s && s.completedAt);
}

export interface WeekCell {
  idx: number;
  date: string;
  md: string;
  dayType: DayKind;
  tense: DayTense;
  isToday: boolean;
  trained: boolean;
  hasRecord: boolean;
  editable: boolean;
}

export function buildWeekCells(
  week: DayKind[],
  today: string,
  offset: number,
  sessions: Record<string, SessionLite | undefined>,
): WeekCell[] {
  return weekDates(today, offset).map((date, idx) => {
    const tense = dayTense(date, today);
    const s = sessions[date];
    const recorded = tense === 'past' && s && s.dayType && DAY_KINDS.indexOf(s.dayType) >= 0 ? s.dayType : null;
    return {
      idx,
      date,
      md: shortDate(date),
      dayType: recorded || week[idx] || 'rest',
      tense,
      isToday: tense === 'today',
      trained: isTrained(s),
      hasRecord: !!s,
      // §3.4-4：今天已开练或已完成（当天有任何记录）→ 锁定类型
      editable: canEditDay(date, today) && !(tense === 'today' && !!s),
    };
  });
}

/** 点格子后的动作：可改 → ActionSheet；过去日有记录 → 看记录；否则 toast */
export function tapAction(cell: Pick<WeekCell, 'editable' | 'hasRecord'> & { isToday?: boolean }): 'edit' | 'record' | 'none' | 'locked' {
  if (cell.editable) return 'edit';
  if (cell.isToday) return 'locked';
  return cell.hasRecord ? 'record' : 'none';
}

/** 过去某天记录的文字摘要（复用 sessions 数据，弹窗展示） */
export function sessionSummary(s: SessionLite, nameOf: (id: string) => string): string {
  const lines = (s.exercises || [])
    .filter((e) => e.sets && e.sets.length)
    .map((e) => `${nameOf(e.exerciseId)}：${e.sets.map((x) => `${x.weight || 0}kg×${x.reps || 0}`).join('、')}`);
  const head = s.completedAt ? '已完成' : '未完成';
  return lines.length ? `${head}\n${lines.join('\n')}` : `${head}（无组记录）`;
}

/** 开练时对当日已有记录的处理：只恢复与生效类型一致的未完成记录 */
export function restoreDecision(existing: SessionLite | null | undefined, dayType: DayKind): 'restore' | 'fresh' | 'completed' {
  if (!existing) return 'fresh';
  if (isTrained(existing)) return 'completed';
  return existing.dayType === dayType ? 'restore' : 'fresh';
}

/** §3.4-4：今天有任何记录（开练或完成）→ 锁定，不能改类型 */
export function isTodayLocked(todaySession: SessionLite | null | undefined): boolean {
  return !!todaySession;
}

export const TODAY_LOCKED_TIP = '今天已开练，训练类型已锁定';

/** 最长连续训练天数（周日→周一循环计算）；全训练返回 7 */
export function maxConsecutiveTraining(week: DayKind[]): number {
  if (week.every((d) => d !== 'rest')) return week.length;
  let best = 0;
  let run = 0;
  for (let i = 0; i < week.length * 2; i++) {
    run = week[i % week.length] !== 'rest' ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return Math.min(best, week.length);
}

export const STREAK_SOFT_LIMIT = 3;
export const STREAK_SOFT_TIP = '已连续训练超过 3 天，注意安排休息';

/** §3.4-6：连续训练 >3 天只软提示，不拦截 */
export function streakSoftTip(week: DayKind[]): string {
  return maxConsecutiveTraining(week) > STREAK_SOFT_LIMIT ? STREAK_SOFT_TIP : '';
}

/** 计划页整月日历（纯函数，便于单测）：6 行 × 7 列，周一起 */
import { DayKind, DAY_KINDS, SessionLite, dayTense, DayTense, isStarted, isTrained, pinnedTodayType, PAST_NO_RECORD_LABEL } from './schedule';

export const MONTH_WEEKDAY_HEADER = ['一', '二', '三', '四', '五', '六', '日'];
const KIND_LABEL: Record<DayKind, string> = { push: '推', pull: '拉', legs: '腿', rest: '休' };
const pad = (n: number) => `${n}`.padStart(2, '0');
const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export interface MonthCell {
  date: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
  tense: DayTense;
  /** 周一=0 … 周日=6 */
  weekdayIdx: number;
  dayType: DayKind | null;
  label: string;
  trained: boolean;
  hasRecord: boolean;
  noRecord: boolean;
  editable: boolean;
}

/** 由 today 所在月偏移 offset 个月 → { year, month(1-12) } */
export function shiftMonth(today: string, offset: number): { year: number; month: number } {
  const [y, m] = today.split('-').map(Number);
  const d = new Date(y, m - 1 + Math.trunc(Number(offset) || 0), 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

/** 首次使用日：档案创建日（本地日期）与最早一条会话日期中较早者；都没有则为 today */
export function firstUseDate(createdAt: string | null | undefined, sessionDates: string[], today: string): string {
  const c: string[] = [];
  if (createdAt) {
    const d = new Date(createdAt);
    if (!isNaN(d.getTime())) c.push(fmt(d));
  }
  sessionDates.forEach((x) => /^\d{4}-\d{2}-\d{2}$/.test(x) && c.push(x));
  c.push(today);
  return c.sort()[0];
}

/** §3.5-2：翻月范围 —— 最早到首次使用那个月，最晚到下个月 */
export function monthOffsetRange(today: string, firstUse: string): { min: number; max: number } {
  const [ty, tm] = today.split('-').map(Number);
  const [fy, fm] = firstUse.split('-').map(Number);
  return { min: Math.min(0, (fy - ty) * 12 + (fm - tm)), max: 1 };
}

export function clampMonthOffset(offset: number, range: { min: number; max: number }): number {
  const n = Math.trunc(Number(offset) || 0);
  return Math.max(range.min, Math.min(range.max, n));
}

export function monthTitle(year: number, month: number): string {
  return `${year}年${month}月`;
}

/** 42 个日期（周一起），month 为 1-12 */
export function monthDates(year: number, month: number): string[] {
  const first = new Date(year, month - 1, 1);
  const js = first.getDay();
  const lead = js === 0 ? 6 : js - 1;
  return Array.from({ length: 42 }, (_, i) => fmt(new Date(year, month - 1, 1 - lead + i)));
}

export function buildMonthCells(
  year: number,
  month: number,
  today: string,
  week: DayKind[],
  sessions: Record<string, SessionLite | undefined>,
): MonthCell[] {
  return monthDates(year, month).map((date, i) => {
    const [, m, d] = date.split('-').map(Number);
    const weekdayIdx = i % 7;
    const tense = dayTense(date, today);
    const raw = sessions[date];
    const s = isStarted(raw) ? raw : undefined; // §3.4-9 空草稿视同无记录
    const trained = isTrained(s);
    let dayType: DayKind | null;
    let label: string;
    if (tense === 'past') {
      // §3.4-7：过去日只显示实际记录
      dayType = s && s.dayType && DAY_KINDS.indexOf(s.dayType) >= 0 ? s.dayType : null;
      label = trained ? '✓已练' : dayType ? KIND_LABEL[dayType] : PAST_NO_RECORD_LABEL;
    } else {
      dayType = pinnedTodayType(week, weekdayIdx, tense === 'today' ? s : null);
      label = KIND_LABEL[dayType];
    }
    return {
      date,
      day: d,
      inMonth: m === month,
      isToday: tense === 'today',
      tense,
      weekdayIdx,
      dayType,
      label,
      trained,
      hasRecord: !!s,
      noRecord: tense === 'past' && !dayType,
      editable: tense !== 'past' && !(tense === 'today' && !!s),
    };
  });
}

/** ActionSheet 标题：课表按星期存储，改一天即改每周这一天 */
export function editSheetTitle(weekdayIdx: number): string {
  return `修改每周${MONTH_WEEKDAY_HEADER[weekdayIdx] || ''}`;
}

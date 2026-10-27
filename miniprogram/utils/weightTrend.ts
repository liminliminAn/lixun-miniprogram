/**
 * 体重页判定（纯函数）。单测：tests/weightTrend.test.js
 * - 少于 2 个体重点 → 空状态
 * - 最近 7 天（含今天）≥4 条记录才算「数据够密」：才显示 7 日移动平均、周均变化、节奏卡
 * - 节奏卡仅 cut / recomp；判定共用 judgeWeeklyRate：
 *     drop = 上周均值 - 本周均值
 *     stable：0.2 ≤ drop ≤ min(1.0, 体重×1%)
 *     too_fast：drop > min(1.0, 体重×1%) → 「>1%」软提示
 *     slow：其余（含上升）
 */

export const MIN_POINTS = 2;
export const DENSE_WINDOW_DAYS = 7;
export const DENSE_MIN_ENTRIES = 4;
export const STABLE_MIN_DROP_KG = 0.2;
export const STABLE_MAX_DROP_KG = 1.0;
export const STABLE_MAX_DROP_PCT = 0.01;

export type RateJudgement = 'stable' | 'too_fast' | 'slow';

function dayNum(d: string): number {
  const [y, m, dd] = d.split('-').map(Number);
  return Math.round(Date.UTC(y, m - 1, dd) / 86400000);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** [today-from, today-to] 天窗口内的记录（from ≥ to，单位天） */
function inWindow(list: BodyWeightEntry[], today: string, fromDaysAgo: number, toDaysAgo: number): BodyWeightEntry[] {
  const t = dayNum(today);
  return list.filter((e) => {
    const ago = t - dayNum(e.date);
    return ago <= fromDaysAgo && ago >= toDaysAgo;
  });
}

function avg(list: BodyWeightEntry[]): number {
  return list.reduce((s, e) => s + e.kg, 0) / list.length;
}

export function hasEnoughPoints(list: BodyWeightEntry[]): boolean {
  return list.length >= MIN_POINTS;
}

/** 最近 7 天（含今天）是否 ≥4 条 */
export function isDense(list: BodyWeightEntry[], today: string): boolean {
  return inWindow(list, today, DENSE_WINDOW_DAYS - 1, 0).length >= DENSE_MIN_ENTRIES;
}

/** 7 日移动平均（每个记录点取其前 7 天含当天的均值）；不够密返回 null */
export function movingAverage7(list: BodyWeightEntry[], today: string): { date: string; ma: number }[] | null {
  if (!isDense(list, today)) return null;
  return list
    .slice()
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((e) => ({ date: e.date, ma: round2(avg(inWindow(list, e.date, DENSE_WINDOW_DAYS - 1, 0))) }));
}

/** 周均变化（本 7 天均值 - 前 7 天均值）；两个窗口都需 ≥4 条，否则 null */
export function weeklyAvgChange(list: BodyWeightEntry[], today: string): number | null {
  const cur = inWindow(list, today, 6, 0);
  const prev = inWindow(list, today, 13, 7);
  if (cur.length < DENSE_MIN_ENTRIES || prev.length < DENSE_MIN_ENTRIES) return null;
  return round2(avg(cur) - avg(prev));
}

/** 唯一的节奏判定函数：节奏卡与 >1% 软提示共用 */
export function judgeWeeklyRate(weeklyChangeKg: number, weightKg: number): RateJudgement {
  const drop = -weeklyChangeKg;
  const max = Math.min(STABLE_MAX_DROP_KG, weightKg * STABLE_MAX_DROP_PCT);
  if (drop > max) return 'too_fast';
  if (drop >= STABLE_MIN_DROP_KG) return 'stable';
  return 'slow';
}

export function showsRhythmCard(crowd: CrowdId): boolean {
  return crowd === 'cut' || crowd === 'recomp';
}

export interface WeightTrendView {
  empty: boolean;
  dense: boolean;
  ma: { date: string; ma: number }[] | null;
  weeklyChange: number | null;
  rhythm: RateJudgement | null;
  softTip: boolean;
}

export function buildWeightTrend(list: BodyWeightEntry[], today: string, crowd: CrowdId): WeightTrendView {
  if (!hasEnoughPoints(list)) {
    return { empty: true, dense: false, ma: null, weeklyChange: null, rhythm: null, softTip: false };
  }
  const dense = isDense(list, today);
  const ma = movingAverage7(list, today);
  const weeklyChange = dense ? weeklyAvgChange(list, today) : null;
  let rhythm: RateJudgement | null = null;
  if (weeklyChange !== null && showsRhythmCard(crowd)) {
    const latest = list.slice().sort((a, b) => (a.date < b.date ? 1 : -1))[0];
    rhythm = judgeWeeklyRate(weeklyChange, latest.kg);
  }
  return { empty: false, dense, ma, weeklyChange, rhythm, softTip: rhythm === 'too_fast' };
}

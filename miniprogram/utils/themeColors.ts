/** 与 app.wxss 亮/暗变量保持一致（canvas 无法读取 CSS 变量）。单测校验与 app.wxss 同步 */
export const THEME_COLORS = {
  dark: { accent: '#2EE6C5', inkSecondary: '#8B93A1', border: '#2A303C', surface: '#1A1E26', ink: '#F2F4F7' },
  light: { accent: '#0D9B86', inkSecondary: '#5C6370', border: '#E6E8EC', surface: '#FFFFFF', ink: '#12141A' },
} as const;

export type ThemeName = keyof typeof THEME_COLORS;

export function themeColors(theme?: string) {
  return theme === 'light' ? THEME_COLORS.light : THEME_COLORS.dark;
}

export interface ChartPoint { x: number; y: number }

/** 把 {date,kg,ma?} 映射到画布坐标（按日期升序；纵轴留 10% 边距） */
export function chartGeometry(
  list: { date: string; kg: number; ma?: number }[],
  width: number,
  height: number,
  pad = 24,
): { raw: ChartPoint[]; ma: ChartPoint[]; min: number; max: number } {
  const pts = list.slice().sort((a, b) => (a.date < b.date ? -1 : 1));
  if (!pts.length) return { raw: [], ma: [], min: 0, max: 0 };
  const vals: number[] = [];
  pts.forEach((p) => {
    vals.push(p.kg);
    if (typeof p.ma === 'number') vals.push(p.ma);
  });
  let min = Math.min(...vals);
  let max = Math.max(...vals);
  const span = Math.max(max - min, 0.5);
  min -= span * 0.1;
  max += span * 0.1;
  const n = pts.length;
  const x = (i: number) => (n === 1 ? width / 2 : pad + (i * (width - 2 * pad)) / (n - 1));
  const y = (v: number) => pad + ((max - v) / (max - min)) * (height - 2 * pad);
  const raw = pts.map((p, i) => ({ x: x(i), y: y(p.kg) }));
  const ma: ChartPoint[] = [];
  pts.forEach((p, i) => {
    if (typeof p.ma === 'number') ma.push({ x: x(i), y: y(p.ma) });
  });
  return { raw, ma, min, max };
}

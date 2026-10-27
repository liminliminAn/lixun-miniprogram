/**
 * IT2-02 饮食计算器（纯函数）。单测：tests/diet.test.js
 * 取值（g/kg 体重，均在产品给定区间内）：
 *  recomp  P1.7  C2.6（休息日 2.2） F0.9
 *  cut     P1.8  C2.2（下限，训练/休息日同） F0.8
 *  bulk    P1.7  C3.2（休息日 3.0） F1.0
 *  beginner 仅蛋白 P1.6，不给碳水/脂肪/热量
 * 克数四舍五入取整；kcal = round(4P + 4C + 9F)（用取整后的克数）。
 * 参考起点，非医疗建议。
 */

export interface MacroRate {
  p: number;
  c?: number;
  cRest?: number;
  f?: number;
}

export const DIET_RATES: Record<CrowdId, MacroRate> = {
  recomp: { p: 1.7, c: 2.6, cRest: 2.2, f: 0.9 },
  cut: { p: 1.8, c: 2.2, cRest: 2.2, f: 0.8 },
  bulk: { p: 1.7, c: 3.2, cRest: 3.0, f: 1.0 },
  beginner: { p: 1.6 },
};

export interface MacroTarget {
  proteinG: number;
  carbsG: number | null;
  fatG: number | null;
  kcal: number | null;
  proteinOnly: boolean;
}

export const DIET_DISCLAIMER = '参考起点，非医疗建议';

export function calcMacros(
  crowd: CrowdId,
  bodyweightKg: number,
  isRestDay: boolean,
  rates: Record<CrowdId, MacroRate> = DIET_RATES,
): MacroTarget | null {
  if (!(bodyweightKg > 0)) return null;
  const r = rates[crowd] || rates.recomp;
  const proteinG = Math.round(bodyweightKg * r.p);
  if (r.c === undefined || r.f === undefined) {
    return { proteinG, carbsG: null, fatG: null, kcal: null, proteinOnly: true };
  }
  const cRate = isRestDay ? (r.cRest !== undefined ? r.cRest : r.c) : r.c;
  const carbsG = Math.round(bodyweightKg * cRate);
  const fatG = Math.round(bodyweightKg * r.f);
  const kcal = Math.round(4 * proteinG + 4 * carbsG + 9 * fatG);
  return { proteinG, carbsG, fatG, kcal, proteinOnly: false };
}

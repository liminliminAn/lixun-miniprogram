"use strict";
/**
 * IT2-02 饮食计算器（纯函数）。单测：tests/diet.test.js
 * 取值（g/kg 体重，均在产品给定区间内）：
 *  recomp  P1.7  C2.6（休息日 2.2） F0.9
 *  cut     P1.8  C2.2（下限，训练/休息日同） F0.8
 *  bulk    P1.8  C4.5（区间 4.0–5.0；休息日取下限 3.0，区间 3.0–3.5） F0.9（P 区间 1.6–2.0，F 0.8–1.0）
 *  beginner 仅蛋白 P1.6，不给碳水/脂肪/热量
 * 克数四舍五入取整；kcal = round(4P + 4C + 9F)（用取整后的克数）。
 * 参考起点，非医疗建议。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BULK_DISCLAIMER = exports.DIET_DISCLAIMER = exports.DIET_RATES = void 0;
exports.dietDisclaimer = dietDisclaimer;
exports.calcMacros = calcMacros;
exports.DIET_RATES = {
    recomp: { p: 1.7, c: 2.6, cRest: 2.2, f: 0.9 },
    cut: { p: 1.8, c: 2.2, cRest: 2.2, f: 0.8 },
    bulk: { p: 1.8, c: 4.5, cRest: 3.0, f: 0.9 },
    beginner: { p: 1.6 },
};
exports.DIET_DISCLAIMER = '参考起点，非医疗建议';
/** P2-5：bulk 不承诺「小盈余」 */
exports.BULK_DISCLAIMER = '参考起点；若两周体重没有上涨，每天加 25g 碳水。非医疗建议。';
function dietDisclaimer(crowd) {
    return crowd === 'bulk' ? exports.BULK_DISCLAIMER : exports.DIET_DISCLAIMER;
}
function calcMacros(crowd, bodyweightKg, isRestDay, rates = exports.DIET_RATES) {
    if (!(bodyweightKg > 0))
        return null;
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

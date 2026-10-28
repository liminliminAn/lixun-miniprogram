/** node tests/diet.test.js — tests/lib/diet.js 由 miniprogram/utils/diet.ts 经 tsc 生成 */
const assert = require('assert');
const { calcMacros, DIET_RATES, DIET_DISCLAIMER, dietDisclaimer } = require('./lib/diet');

let m = calcMacros('recomp', 70, false);
assert.deepStrictEqual([m.proteinG, m.carbsG, m.fatG, m.kcal], [119, 182, 63, 1771]); // 4*119+4*182+9*63
m = calcMacros('recomp', 70, true);
assert.strictEqual(m.carbsG, 154); // 休息日下限 2.2
m = calcMacros('cut', 70, false);
assert.deepStrictEqual([m.proteinG, m.carbsG, m.fatG], [126, 154, 56]); // 碳水下限
assert.strictEqual(calcMacros('cut', 70, true).carbsG, 154);
m = calcMacros('bulk', 70, false);
assert.deepStrictEqual([m.proteinG, m.carbsG, m.fatG, m.kcal], [126, 315, 63, 2331]); // 4*126+4*315+9*63
assert.strictEqual(calcMacros('bulk', 70, true).carbsG, 210); // 3.0 下限
m = calcMacros('beginner', 70, false);
assert.deepStrictEqual(m, { proteinG: 112, carbsG: null, fatG: null, kcal: null, proteinOnly: true });
assert.strictEqual(calcMacros('recomp', 0, false), null);
assert.notStrictEqual(calcMacros('recomp', 72, false).proteinG, calcMacros('recomp', 70, false).proteinG); // 体重变化即重算
// 取值落在区间内
const inR = (v, a, b) => v >= a && v <= b;
assert.ok(inR(DIET_RATES.recomp.p, 1.6, 1.8) && inR(DIET_RATES.recomp.c, 2.2, 3.0) && inR(DIET_RATES.recomp.f, 0.8, 1.0));
assert.ok(inR(DIET_RATES.bulk.c, 4.0, 5.0) && inR(DIET_RATES.bulk.cRest, 3.0, 3.5) && DIET_RATES.bulk.cRest === 3.0 && DIET_RATES.cut.c === 2.2);
assert.ok(inR(DIET_RATES.bulk.p, 1.6, 2.0) && inR(DIET_RATES.bulk.f, 0.8, 1.0));
assert.strictEqual(dietDisclaimer('bulk'), '参考起点；若两周体重没有上涨，每天加 25g 碳水。非医疗建议。');
assert.strictEqual(dietDisclaimer('recomp'), DIET_DISCLAIMER);
assert.ok(!/小盈余/.test(dietDisclaimer('bulk')));
assert.strictEqual(DIET_DISCLAIMER, '参考起点，非医疗建议');
console.log('diet tests passed');

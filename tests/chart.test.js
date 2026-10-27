/** node tests/chart.test.js — tests/lib/themeColors.js 由 miniprogram/utils/themeColors.ts 经 tsc 生成 */
const assert = require('assert');
const fs = require('fs');
const { THEME_COLORS, themeColors, chartGeometry } = require('./lib/themeColors');

// JS 色值映射必须与 app.wxss 一致（暗色为根变量，亮色在 prefers-color-scheme: light 块）
const css = fs.readFileSync(__dirname + '/../miniprogram/app.wxss', 'utf8');
const lightIdx = css.indexOf('prefers-color-scheme: light');
assert.ok(lightIdx > 0);
const pick = (part, name) => (part.match(new RegExp(`--color-${name}:\\s*(#[0-9A-Fa-f]{6})`)) || [])[1];
const map = { accent: 'accent', inkSecondary: 'ink-secondary', border: 'border', surface: 'surface', ink: 'ink' };
Object.entries(map).forEach(([k, v]) => {
  assert.strictEqual(THEME_COLORS.dark[k].toUpperCase(), pick(css.slice(0, lightIdx), v).toUpperCase(), `dark ${k}`);
  assert.strictEqual(THEME_COLORS.light[k].toUpperCase(), pick(css.slice(lightIdx), v).toUpperCase(), `light ${k}`);
});
assert.strictEqual(themeColors('light'), THEME_COLORS.light);
assert.strictEqual(themeColors(undefined), THEME_COLORS.dark);

// 几何
assert.deepStrictEqual(chartGeometry([], 300, 150).raw, []);
const g = chartGeometry([{ date: '2026-10-02', kg: 70, ma: 70.5 }, { date: '2026-10-01', kg: 71 }, { date: '2026-10-03', kg: 69 }], 300, 150);
assert.strictEqual(g.raw.length, 3);
assert.strictEqual(g.ma.length, 1); // 仅有 ma 的点画均线
assert.strictEqual(g.raw[0].x, 24); // 按日期升序
assert.strictEqual(g.raw[2].x, 276);
assert.ok(g.raw[0].y < g.raw[2].y); // 71 在 69 上方
g.raw.forEach((p) => assert.ok(p.y >= 24 && p.y <= 126));
assert.strictEqual(chartGeometry([{ date: 'a', kg: 70 }], 300, 150).raw[0].x, 150);
console.log('chart tests passed');

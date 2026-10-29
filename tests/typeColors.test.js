/** node tests/typeColors.test.js — 类型色 token（推橙/拉蓝/腿绿/休深灰）：亮暗两套，对实际底色 WCAG AA ≥4.5:1 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const read = (p) => fs.readFileSync(path.join(__dirname, '../miniprogram', p), 'utf8');
const app = read('app.wxss');
const li = app.indexOf('prefers-color-scheme: light');
const themes = { dark: app.slice(0, li), light: app.slice(li) };
const pick = (part, name) => (part.match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`)) || [])[1];
const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
assert.ok(Math.abs(ratio('#000000', '#FFFFFF') - 21) < 1e-9);
const report = [];
for (const [theme, part] of Object.entries(themes)) {
  // 周视图 chip 底 = --color-bg；月历格子底 = 卡片 --color-surface
  const bgs = { chip: pick(part, 'color-bg'), cell: pick(part, 'color-surface') };
  for (const t of ['push', 'pull', 'legs', 'rest']) {
    const fg = pick(part, `type-${t}`);
    assert.ok(fg, `${theme} 缺 --type-${t}`);
    for (const [where, bg] of Object.entries(bgs)) {
      const r = ratio(fg, bg);
      report.push(`${theme} ${t} ${fg} on ${where} ${bg}: ${r.toFixed(2)}`);
      assert.ok(r >= 4.5, `${theme} --type-${t} ${fg} 对 ${where} ${bg} 只有 ${r.toFixed(2)}:1`);
    }
  }
  // 未完成用 ink-secondary，也需达标
  assert.ok(ratio(pick(part, 'color-ink-secondary'), bgs.cell) >= 4.5);
}
// 色相：推橙、拉蓝、腿绿（R/G/B 主导）
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
for (const part of Object.values(themes)) {
  const [pr, pg, pb] = rgb(pick(part, 'type-push')); assert.ok(pr > pg && pg > pb, '推为橙');
  const [, , bb] = rgb(pick(part, 'type-pull')); assert.ok(bb === Math.max(...rgb(pick(part, 'type-pull'))), '拉为蓝');
  const g = rgb(pick(part, 'type-legs')); assert.ok(g[1] === Math.max(...g), '腿为绿');
  const r = rgb(pick(part, 'type-rest')); assert.ok(Math.max(...r) - Math.min(...r) < 40, '休为灰');
}
// 接线：周视图 chip 和月历标签都用类型 token，chip 底为 --color-bg，过去日 chip 不降透明度
const css = read('pages/plan/plan.wxss');
for (const t of ['push', 'pull', 'legs', 'rest']) {
  assert.ok(new RegExp(`\\.dt\\.${t} \\{ background: var\\(--color-bg\\); color: var\\(--type-${t}\\); \\}`).test(css), `.dt.${t}`);
  assert.ok(new RegExp(`\\.m-type\\.${t}[^{]*\\{ color: var\\(--type-${t}\\); \\}`).test(css), `.m-type.${t}`);
}
assert.ok(!/\.cell\.past \.dt \{[^}]*opacity/.test(css));
// P3-3：非本月格子（.m-cell.out）的「休」按实际透明度与卡片底混色后仍需 ≥4.5:1（两套主题）
const outOpacity = (() => { const m = css.match(/\.m-cell\.out \{[^}]*opacity:\s*([\d.]+)/); return m ? parseFloat(m[1]) : 1; })();
const blend = (fg, bg, a) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(fg.slice(i, i + 2), 16) * a + parseInt(bg.slice(i, i + 2), 16) * (1 - a)).toString(16).padStart(2, '0')).join('');
assert.ok(/\.m-cell\.out \.m-type \{ color: var\(--type-rest\); \}/.test(css), '非本月标签用 --type-rest');
for (const [theme, part] of Object.entries(themes)) {
  const bg = pick(part, 'color-surface');
  for (const tok of ['type-rest', 'color-ink-secondary']) {
    const r = ratio(blend(pick(part, tok), bg, outOpacity), bg);
    report.push(`${theme} out ${tok} opacity ${outOpacity}: ${r.toFixed(2)}`);
    assert.ok(r >= 4.5, `${theme} 非本月 ${tok} 只有 ${r.toFixed(2)}:1`);
  }
}
if (process.env.SHOW) console.log(report.join('\n'));
console.log('typeColors.test ok');

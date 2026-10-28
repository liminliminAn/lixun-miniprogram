/** node tests/exerciseCards.test.js — 图文卡配置合法性 */
const assert = require('assert');
const fs = require('fs');
const { buildExerciseCard, subpkgImage, DETAIL_PAGE } = require('./lib/exerciseCards');
const product = require('path').join(__dirname, '../../lixun-pm/exercises.json'); const productJson = fs.existsSync(product) ? require(product) : null; // 产品源文件不在仓库内，缺失时跳过逐条比对
const cfg = require('../miniprogram/config/exercise-cards.js');

const src = fs.readFileSync(__dirname + '/../miniprogram/constants/exercises.ts', 'utf8');
const ids = [...src.matchAll(/id: '([^']+)'/g)].map((m) => m[1]);
assert.ok(ids.length >= 15);
assert.ok(!fs.existsSync(__dirname + '/../miniprogram/assets/exercise-placeholder.png')); // D2：去掉占位图
ids.forEach((id) => {
  const e = cfg.exercises[id];
  assert.ok(e, `missing card ${id}`);
  ['steps', 'cues', 'mistakes'].forEach((k) => {
    assert.ok(Array.isArray(e[k]) && e[k].length === 3, `${id}.${k}`);
    e[k].forEach((t) => assert.ok(typeof t === 'string' && t.trim()));
  });
  assert.strictEqual(e.image, `/subpkg/exercises/${e.contentId}.webp`); // 分包写实配图路径
  const v = buildExerciseCard(cfg, id);
  assert.strictEqual(v.hasImage, true); // 15 张图均已入库
  assert.strictEqual(v.detailImage, e.image);
  assert.ok(Array.isArray(e.contraindications) && e.contraindications.length >= 1 && e.contraindications.length <= 2, `${id} 注意`);
  assert.deepStrictEqual(v.contraindications, e.contraindications);
  assert.strictEqual(v.medicalNote, '出现明显疼痛、麻木或放射痛时停止，并就医确认');
  assert.strictEqual(v.detailUrl, `${DETAIL_PAGE}?id=${id}`);
  assert.strictEqual(v.dose, e.dose.text);
  assert.ok(/^\d(–\d)? 组 × \d+–\d+ 次，/.test(v.dose), `${id} dose ${v.dose}`); // 剂量存在
  assert.ok(e.dose.text.includes(`${e.dose.repMin}–${e.dose.repMax} 次`)); // rep 区间与 dose 文案一致
  assert.strictEqual(v.doseNote, '剂量为通用建议，因人而异');
});
Object.keys(cfg.exercises).forEach((k) => assert.ok(ids.includes(k), `unknown id ${k}`));
const s = JSON.stringify(cfg);
['谭成义', '作者', 'author', 'attribution'].forEach((w) => assert.ok(!s.includes(w), `no attribution: ${w}`));
assert.strictEqual(buildExerciseCard(cfg, 'nope'), null);
assert.strictEqual(buildExerciseCard({ exercises: { a: { steps: ['x', ''], image: '/i.png' } } }, 'a').steps.length, 1);
assert.ok(!/待核实|参考量待定/.test(s));
// 与产品 exercises.json 逐条一致（按顺序映射 id）
if (productJson) assert.strictEqual(productJson.exercises.length, 15);
(productJson ? productJson.exercises : []).forEach((p) => {
  const id = Object.keys(cfg.exercises).find((k) => cfg.exercises[k].contentId === p.id);
  assert.ok(id, p.id);
  const e = cfg.exercises[id];
  assert.deepStrictEqual([e.name, e.steps, e.cues, e.mistakes, e.dose.text], [p.name, p.steps, p.cues, p.mistakes, p.dose]);
});
assert.strictEqual(subpkgImage('subpkg/exercises/a.png'), '/subpkg/exercises/a.png');
assert.strictEqual(subpkgImage('/assets/x.png'), '');
{ const n = buildExerciseCard({ exercises: { a: { steps: [], contentId: 'a', image: 'subpkg/exercises/a.png' } } }, 'a');
  assert.deepStrictEqual([n.hasImage, n.detailImage], [false, '']); } // 不在 images 列表 → 无图，整块隐藏
assert.strictEqual(buildExerciseCard({ _meta: { images: ['a'] }, exercises: { a: { contentId: 'a', image: 'subpkg/exercises/a.png' } } }, 'a').hasImage, true);
// _meta.images 必须与 subpkg/exercises 下的动作 webp（非 warmup_/posture_/selfcheck_）完全一致；旧线稿 png 已删除
{ const all = fs.readdirSync(require('path').join(__dirname, '../miniprogram/subpkg/exercises'));
  assert.ok(!all.some((f) => f.endsWith('.png')), 'old line-art png left');
  const files = all.filter((f) => f.endsWith('.webp') && !/^(warmup|posture|selfcheck)_/.test(f)).map((f) => f.slice(0, -5)).sort();
  assert.deepStrictEqual(cfg._meta.images.slice().sort(), files);
  assert.strictEqual(files.length, 15); }
if (productJson) productJson.exercises.forEach((p) => {
  const id = Object.keys(cfg.exercises).find((k) => cfg.exercises[k].contentId === p.id);
  assert.deepStrictEqual(cfg.exercises[id].contraindications, p.contraindications);
});
// 页面不再引用占位图 / 旧常量要点
['pages/session/session.wxml', 'components/exercise-card/exercise-card.wxml', 'subpkg/exercises/detail/detail.wxml', 'pages/today/today.wxml'].forEach((f) => {
  const t = fs.readFileSync(require('path').join(__dirname, '../miniprogram', f), 'utf8');
  assert.ok(!/exercise-placeholder|\.tips\b|tips=|contraindications="|禁忌：/.test(t), f);
});
['pages/session/session.wxml', 'components/exercise-card/exercise-card.wxml'].forEach((f) => {
  const t = fs.readFileSync(require('path').join(__dirname, '../miniprogram', f), 'utf8');
  assert.ok(/wx:if="\{\{[^}]*hasImage\}\}"[^>]*>查看动作图解/.test(t) && t.includes('medicalNote') && t.includes('注意'), f);
});
// 不放假图：分包目录下只有详情页代码；存在的配图必须是配置里引用的
const sub = require('path').join(__dirname, '../miniprogram/subpkg/exercises');
fs.readdirSync(sub).filter((f) => /\.(png|jpe?g|webp)$/.test(f) && !/^(warmup|posture|selfcheck)_/.test(f)).forEach((f) =>
  assert.ok(Object.values(cfg.exercises).some((e) => e.image === `/subpkg/exercises/${f}`), `stray image ${f}`));
const app = JSON.parse(fs.readFileSync(__dirname + '/../miniprogram/app.json', 'utf8'));
assert.ok(!['warmup_pull_07.webp', 'warmup_pull_11.webp'].some((f) => fs.existsSync(sub + '/' + f)), 'duplicate warmup art should be removed');
assert.ok(/border-radius:\s*24rpx/.test(fs.readFileSync(sub + '/detail/detail.wxss', 'utf8')));
assert.deepStrictEqual(app.subPackages, [{ root: 'subpkg/exercises', name: 'exercises', pages: ['detail/detail'] }]);
assert.ok(fs.existsSync(sub + '/detail/detail.wxml') && /binderror="onImgError"/.test(fs.readFileSync(sub + '/detail/detail.wxml', 'utf8')));
const G = { A: ['barbell_bench', 'db_incline_press', 'dip', 'single_machine_row', 'flared_row', 'bulgarian_split_squat', 'goblet_squat', 'rdl', 'single_rdl'],
  B: ['single_cable_pulldown', 'neutral_lat_pulldown', 'back_extension'], C: ['skull_crusher', 'y_lateral_raise', 'cable_curl'] };
G.A.forEach((id) => assert.strictEqual(buildExerciseCard(cfg, id).dose, '3–4 组 × 6–10 次，留 2 次余量（RPE≈8），组间 2–3 分钟'));
G.B.forEach((id) => assert.strictEqual(buildExerciseCard(cfg, id).dose, '3 组 × 8–12 次，RPE≈8，组间 90 秒'));
G.C.forEach((id) => assert.strictEqual(buildExerciseCard(cfg, id).dose, '3 组 × 10–15 次，可接近力竭，组间 60–90 秒'));
assert.strictEqual([...G.A, ...G.B, ...G.C].length, Object.keys(cfg.exercises).length);
const wx = fs.readFileSync(__dirname + '/../miniprogram/components/exercise-card/exercise-card.wxml', 'utf8');
assert.ok(wx.includes('card.doseNote') && !wx.includes('参考量待定'));
console.log('exerciseCards tests passed');

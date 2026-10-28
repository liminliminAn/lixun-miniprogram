/** node tests/warmup.test.js — tests/lib/warmup.js 由 miniprogram/utils/warmup.ts 经 tsc 生成 */
const assert = require('assert');
const { rampSets, firstCompound, withWarmup, completedTrainDates, rampConfigFromJson, buildWarmupSections, contentNotes } = require('./lib/warmup');
const cfg = require('../miniprogram/config/warmup.js');

const w = (a) => a.map((s) => `${s.weight}x${s.reps}`);
assert.deepStrictEqual(w(rampSets(60)), ['20x10', '25x8', '35x5', '47.5x3']); // 24→25, 36→35, 48→47.5
assert.deepStrictEqual(w(rampSets(100)), ['20x10', '40x8', '60x5', '80x3']);
assert.deepStrictEqual(w(rampSets(30)), ['20x10', '20x8', '20x5', '25x3']); // 不低于空杆
assert.deepStrictEqual(w(rampSets(22, undefined, false)), ['0x10', '10x8', '12.5x5', '17.5x3']); // 非杠铃空载
assert.deepStrictEqual(rampSets(0), []);
assert.deepStrictEqual(w(rampSets(60, rampConfigFromJson(cfg.rampSets))), ['20x10', '25x8', '35x5', '47.5x3']); // JSON rampSets 一致
assert.deepStrictEqual(w(rampSets(100, rampConfigFromJson({ steps: [{ load: '空杠', reps: 5 }, { loadPct: 50, reps: 5 }] }))), ['20x5', '50x5']); // JSON 覆盖
assert.strictEqual(rampConfigFromJson(undefined).steps.length, 4); // 缺省回退

const ex = [{ exerciseId: 'skull_crusher', sets: [] }, { exerciseId: 'barbell_bench', sets: [] }];
assert.strictEqual(firstCompound(ex).exerciseId, 'barbell_bench');

// 跳过/完成热身不产生 completedAt，不影响连练；坡道组不进 exercises（不计容量）
const draft = { date: '2026-10-27', dayType: 'push', exercises: [{ exerciseId: 'barbell_bench', sets: [{ reps: 8, weight: 60, done: false }] }] };
const skipped = withWarmup(draft, { status: 'skipped', checked: [], ramp: [], elapsedSec: 0, at: 'x' });
assert.strictEqual(skipped.completedAt, undefined);
assert.strictEqual(skipped.exercises[0].sets.length, 1);
const done = withWarmup(draft, { status: 'done', checked: ['ramp_0'], ramp: rampSets(60), elapsedSec: 300, at: 'x' });
assert.strictEqual(done.exercises, draft.exercises);
const store = { '2026-10-26': { ...draft, date: '2026-10-26', completedAt: 'y' }, '2026-10-27': done, '2026-10-25': skipped };
assert.deepStrictEqual(completedTrainDates(store), ['2026-10-26']);
const skippedCompleted = { ...skipped, completedAt: 'z' };
assert.deepStrictEqual(completedTrainDates({ a: skippedCompleted }), ['a']); // 跳过热身仍可计连练

// it2-v2：一般热身 → 放松 → 激活；推日附肩日可选；dose 为真实值
['push', 'pull', 'legs'].forEach((d) => {
  const secs = buildWarmupSections(cfg, d);
  assert.deepStrictEqual(secs.slice(0, 3).map((x) => x.key), ['general', 'release', 'activate']);
  secs.forEach((x) => x.items.forEach((it) => { assert.ok(it.dose.length > 0, it.text); assert.ok(!/待定|待核实/.test(it.dose)); }));
  const ids = secs.flatMap((x) => x.items.map((i) => i.id));
  assert.strictEqual(new Set(ids).size, ids.length);
});
assert.strictEqual(buildWarmupSections(cfg, 'push').pop().optional, true);
assert.strictEqual(buildWarmupSections(cfg, 'legs').length, 3);
const pushAct = buildWarmupSections(cfg, 'push').find((x) => x.key === 'activate').items;
assert.ok(pushAct.some((i) => i.source && i.source.url.startsWith('https://') && i.source.title.startsWith('参考来源')));
// dose 存在且带数字；一般热身文案不再去数字
assert.ok(/\d/.test(buildWarmupSections(cfg, 'pull')[2].items[0].dose));
assert.deepStrictEqual(buildWarmupSections(cfg, 'push')[0].items[0], { id: 'general_0', text: '低强度有氧 2–3 分钟', dose: '2–3 分钟' });
assert.strictEqual(buildWarmupSections(cfg, 'push')[1].items[0].dose, '每部位 30–60 秒');
assert.deepStrictEqual(contentNotes(cfg), { doseNote: '剂量为通用建议，因人而异', pickNote: '热身动作按需挑选，不必全做' });
assert.strictEqual(cfg._meta.version, 'it2-v5');
assert.ok(!JSON.stringify(cfg).includes('待核实'));
// it2-v4：steps/cues 各 3、image=null 隐藏图片区、video 复制「url time」
{
  const { videoLine, VIDEO_TOAST } = require('./lib/warmup');
  const push = buildWarmupSections(cfg, 'push');
  const act = push.find((x) => x.key === 'activate').items;
  const vids = act.filter((i) => i.video).map((i) => i.text);
  assert.deepStrictEqual(vids.sort(), ['下斜方肌激活', '前锯肌激活', '手腕激活'].sort());
  act.filter((i) => i.video).forEach((i) => assert.strictEqual(i.video.copyText, `${i.video.url} ${i.video.time}`));
  ['push', 'pull', 'legs'].forEach((d) => buildWarmupSections(cfg, d).filter((x) => x.key !== 'general').forEach((sec) => sec.items.forEach((i) => {
    assert.strictEqual(i.steps.length, 3, i.text); assert.strictEqual(i.cues.length, 3, i.text); assert.ok(!('image' in i), 'main pkg must not render images');
  })));
  assert.strictEqual(videoLine(cfg.days.pull.video).copyText, 'https://www.douyin.com/video/7638569547629063665 7:38');
  assert.strictEqual(videoLine(cfg.days.legs.video).time, '13:30');
  assert.strictEqual(videoLine(null), null);
  assert.strictEqual(videoLine({ url: 'javascript:x' }), null);
  assert.strictEqual(VIDEO_TOAST, '已复制，可在抖音打开');
  const fs3 = require('fs'), p3 = require('path');
  const wx = fs3.readFileSync(p3.join(__dirname, '../miniprogram/pages/warmup/warmup.wxml'), 'utf8');
  const ts = fs3.readFileSync(p3.join(__dirname, '../miniprogram/pages/warmup/warmup.ts'), 'utf8');
  assert.ok(wx.includes('onCopyVideo') && wx.includes('dayVideo') && !/<image/.test(wx) && wx.includes('wx:if="{{item.figure}}"') && !/<video/.test(wx));
  assert.ok(ts.includes('VIDEO_TOAST') && ts.includes('dataset.copy'));
  const app = JSON.parse(fs3.readFileSync(p3.join(__dirname, '../miniprogram/app.json'), 'utf8'));
  const PR = { network: 'all', packages: ['subpkg/exercises'] };
  assert.deepStrictEqual(app.preloadRule, { 'pages/session/session': PR, 'pages/warmup/warmup': PR, 'pages/posture/posture': PR });
  Object.keys(app.preloadRule).forEach((pg) => assert.ok(app.pages.includes(pg), pg));
  // 会话页只从定稿配置读要点
  const ss = fs3.readFileSync(p3.join(__dirname, '../miniprogram/pages/session/session.ts'), 'utf8');
  assert.ok(ss.includes("require('../../config/exercise-cards.js')") && !/def\?\.(tips|contraindications)/.test(ss));
}
console.log('warmup tests passed');
// 兼容 2.32：源码不允许 require .json
{
  const fs2 = require('fs'), p2 = require('path');
  const walk = (d) => fs2.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(p2.join(d, e.name)) : [p2.join(d, e.name)]);
  walk(p2.join(__dirname, '../miniprogram')).filter((f) => f.endsWith('.ts')).forEach((f) =>
    assert.ok(!/require\([^)]*\.json/.test(fs2.readFileSync(f, 'utf8')), `json require in ${f}`));
}

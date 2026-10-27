/** node tests/warmup.test.js — tests/lib/warmup.js 由 miniprogram/utils/warmup.ts 经 tsc 生成 */
const assert = require('assert');
const { rampSets, firstCompound, withWarmup, completedTrainDates, rampConfigFromJson, buildWarmupSections, DOSE_PLACEHOLDER } = require('./lib/warmup');
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

// 新 schema：一般热身 → 放松 → 激活；推日附肩日可选；dose 一律占位
['push', 'pull', 'legs'].forEach((d) => {
  const secs = buildWarmupSections(cfg, d);
  assert.deepStrictEqual(secs.slice(0, 3).map((x) => x.key), ['general', 'release', 'activate']);
  secs.forEach((x) => x.items.forEach((it) => assert.strictEqual(it.dose, DOSE_PLACEHOLDER)));
  const ids = secs.flatMap((x) => x.items.map((i) => i.id));
  assert.strictEqual(new Set(ids).size, ids.length);
});
assert.strictEqual(buildWarmupSections(cfg, 'push').pop().optional, true);
assert.strictEqual(buildWarmupSections(cfg, 'legs').length, 3);
const pushAct = buildWarmupSections(cfg, 'push').find((x) => x.key === 'activate').items;
assert.ok(pushAct.some((i) => i.source && i.source.url.startsWith('https://') && i.source.title.startsWith('参考来源')));
assert.ok(!JSON.stringify(buildWarmupSections(cfg, 'pull')).match(/\d+\s*(次|组|分钟|秒)/)); // 不显示 dose 数字
console.log('warmup tests passed');
// 兼容 2.32：源码不允许 require .json
{
  const fs2 = require('fs'), p2 = require('path');
  const walk = (d) => fs2.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(p2.join(d, e.name)) : [p2.join(d, e.name)]);
  walk(p2.join(__dirname, '../miniprogram')).filter((f) => f.endsWith('.ts')).forEach((f) =>
    assert.ok(!/require\([^)]*\.json/.test(fs2.readFileSync(f, 'utf8')), `json require in ${f}`));
}

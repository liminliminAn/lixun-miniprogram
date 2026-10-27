/** node tests/warmup.test.js — tests/lib/warmup.js 由 miniprogram/utils/warmup.ts 经 tsc 生成 */
const assert = require('assert');
const { rampSets, firstCompound, withWarmup, completedTrainDates } = require('./lib/warmup');
const cfg = require('../miniprogram/config/warmup.json');

const w = (a) => a.map((s) => `${s.weight}x${s.reps}`);
assert.deepStrictEqual(w(rampSets(60)), ['20x10', '25x8', '35x5', '47.5x3']); // 24→25, 36→35, 48→47.5
assert.deepStrictEqual(w(rampSets(100)), ['20x10', '40x8', '60x5', '80x3']);
assert.deepStrictEqual(w(rampSets(30)), ['20x10', '20x8', '20x5', '25x3']); // 不低于空杆
assert.deepStrictEqual(w(rampSets(22, undefined, false)), ['0x10', '10x8', '12.5x5', '17.5x3']); // 非杠铃空载
assert.deepStrictEqual(rampSets(0), []);
assert.deepStrictEqual(w(rampSets(60, cfg.ramp)), ['20x10', '25x8', '35x5', '47.5x3']); // JSON 配置一致

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

// 三套内容 + 无署名
['push', 'pull', 'legs'].forEach((d) => ['general', 'dynamic', 'activation'].forEach((k) => assert.ok(cfg.days[d][k].length > 0)));
assert.ok(!JSON.stringify(cfg).includes('谭成义'));
console.log('warmup tests passed');

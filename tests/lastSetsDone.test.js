/** node tests/lastSetsDone.test.js — lastSets 只从 done=true 的组更新 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const P = require('./lib/persist');
const prev = { bench: { weight: 60, reps: 8, done: true }, row: { weight: 40, reps: 10, done: true } };
const out = P.mergeLastSets(prev, [
  { exerciseId: 'bench', sets: [{ weight: 62.5, reps: 8, done: true }, { weight: 65, reps: 6, done: true }, { weight: 70, reps: 5, done: false }] },
  { exerciseId: 'row', sets: [{ weight: 0, reps: 8, done: false }, { weight: 0, reps: 8 }] }, // 未勾选：不覆盖
  { exerciseId: 'sq', sets: [] },
]);
assert.deepStrictEqual(out.bench, { weight: 65, reps: 6, done: true });
assert.deepStrictEqual(out.row, prev.row);
assert.ok(!('sq' in out));
assert.deepStrictEqual(prev.bench, { weight: 60, reps: 8, done: true }); // 不改原对象
// 只勾热身（组全未勾）立即保存时，lastSets 不变
assert.deepStrictEqual(P.mergeLastSets(prev, [{ exerciseId: 'bench', sets: [{ weight: 0, reps: 8, done: false }] }]), prev);
const ts = fs.readFileSync(path.join(__dirname, '../miniprogram/services/workout.ts'), 'utf8');
const fn = ts.slice(ts.indexOf('export function saveSession'), ts.indexOf('export function completeSession'));
assert.ok(/mergeLastSets\(getLastSets\(\), session\.exercises\)/.test(fn) && !/ex\.sets\[ex\.sets\.length - 1\]/.test(fn));
console.log('lastSetsDone.test ok');

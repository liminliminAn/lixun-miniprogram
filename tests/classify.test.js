/**
 * classify 单测 — 在项目根执行: node tests/classify.test.js
 * 逻辑与 miniprogram/utils/classify.ts 保持同步
 */
const assert = require('assert');

function classify(p) {
  if (p.jointLimit || p.trainYears === 'lt_half' || p.goal === 'beginner') {
    return 'beginner';
  }
  if (p.goal === 'cut') return 'cut';
  if (p.goal === 'bulk') {
    return p.bfBand === 'very_low' || p.bfBand === 'low' ? 'bulk' : 'recomp';
  }
  if (p.goal === 'recomp') return 'recomp';
  return 'recomp';
}

const base = {
  heightCm: 175,
  weightKg: 70,
  sex: 'male',
  bfBand: 'mid',
  goal: 'recomp',
  trainYears: 'half_to_2',
  daysPerWeek: 4,
};

assert.strictEqual(classify({ ...base, jointLimit: true }), 'beginner');
assert.strictEqual(classify({ ...base, trainYears: 'lt_half' }), 'beginner');
assert.strictEqual(classify({ ...base, goal: 'beginner' }), 'beginner');
assert.strictEqual(classify({ ...base, goal: 'cut' }), 'cut');
assert.strictEqual(
  classify({ ...base, goal: 'bulk', bfBand: 'very_low' }),
  'bulk',
);
assert.strictEqual(classify({ ...base, goal: 'bulk', bfBand: 'low' }), 'bulk');
assert.strictEqual(classify({ ...base, goal: 'bulk', bfBand: 'mid' }), 'recomp');
assert.strictEqual(classify({ ...base, goal: 'bulk', bfBand: 'high' }), 'recomp');
assert.strictEqual(classify({ ...base, goal: 'recomp' }), 'recomp');
assert.strictEqual(classify({ ...base, goal: 'unknown' }), 'recomp');
assert.strictEqual(
  classify({ ...base, goal: 'cut', jointLimit: true }),
  'beginner',
);

console.log('classify.test.js: all passed');

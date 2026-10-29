/** node tests/labels.test.js — 枚举中文标签 + 模板不直接显示英文枚举（tests/lib/labels.js 由 utils/labels.ts 经 tsc 生成） */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const L = require('./lib/labels');
const root = path.join(__dirname, '../miniprogram');

assert.strictEqual(L.goalLabel('recomp'), '增肌减脂');
assert.strictEqual(L.goalLabel('cut'), '减脂');
assert.strictEqual(L.goalLabel('bulk'), '增肌');
assert.strictEqual(L.goalLabel('beginner'), '入门');
assert.strictEqual(L.bfBandLabel('male', 'mid'), '中等（18–25%）');
assert.strictEqual(L.bfBandLabel('female', 'mid'), '中等（25–32%）');
assert.strictEqual(L.sexLabel('female'), '女');
assert.strictEqual(L.trainYearsLabel('half_to_2'), '半年～2年');
assert.strictEqual(L.goalLabel('xxx'), '—');
assert.strictEqual(L.goalLabel('toString'), '—');
const pl = L.profileLabels({ sex: 'male', bfBand: 'high', goal: 'cut', trainYears: 'gt_2', jointLimit: true });
for (const v of Object.values(pl)) assert.ok(!/[a-z_]{3,}/.test(v), '档案标签含英文：' + v);

// 问卷选项文案与共享标签一致（单一来源）
const ob = fs.readFileSync(path.join(root, 'pages/onboarding/onboarding.wxml'), 'utf8');
for (const [k, v] of Object.entries(L.GOAL_LABEL)) assert.ok(ob.includes(`data-v="${k}" bindtap="onGoal">${v}<`), 'goal ' + k);
for (const [k, v] of Object.entries(L.TRAIN_YEARS_LABEL)) assert.ok(ob.includes(`data-v="${k}" bindtap="onYears">${v}<`), 'years ' + k);
assert.ok(/BF_BAND_TEXT\.male\[band\]/.test(fs.readFileSync(path.join(root, 'constants/crowds.ts'), 'utf8')));

// 守卫：所有 wxml 的文本插值里不得直接输出枚举字段
const ENUM_FIELDS = ['goal', 'bfBand', 'sex', 'trainYears', 'crowd', 'dayType', 'level', 'equipment', 'experience', 'rhythm', 'tense', 'band'];
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.wxml') ? [path.join(d, e.name)] : []));
const bad = [];
for (const f of walk(root)) {
  // 去掉标签属性，只看文本节点
  const text = fs.readFileSync(f, 'utf8').replace(/<[^>]*>/g, ' ');
  for (const m of text.matchAll(/\{\{([^}]*)\}\}/g)) {
    const expr = m[1].trim();
    if (/^labels\./.test(expr)) continue; // 已经过 utils/labels 映射
    for (const k of ENUM_FIELDS) {
      if (new RegExp(`(^|\\.)${k}$`).test(expr)) bad.push(`${path.relative(root, f)}: {{${expr}}}`);
    }
  }
}
assert.deepStrictEqual(bad, [], '模板直接显示了英文枚举：\n' + bad.join('\n'));
console.log('labels.test ok');

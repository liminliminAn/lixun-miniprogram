/** node tests/planToast.test.js — plan 页 showToast 只传 title/icon，不夹带多余参数 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const ts = fs.readFileSync(path.join(__dirname, '../miniprogram/pages/plan/plan.ts'), 'utf8');
const calls = ts.match(/wx\.showToast\(\{[^}]*\}\)/g) || [];
assert.ok(calls.length > 0);
for (const c of calls) {
  const keys = c.replace(/^wx\.showToast\(\{|\}\)$/g, '').split(',').map((p) => p.trim().split(':')[0].trim()).filter(Boolean);
  for (const k of keys) assert.ok(['title', 'icon', 'duration'].indexOf(k) >= 0, `showToast 多余参数 ${k}：${c}`);
}
assert.ok(/showToast\(\{ title: TODAY_LOCKED_TIP, icon: 'none' \}\)/.test(ts));
console.log('planToast.test ok');

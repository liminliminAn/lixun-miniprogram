/** node tests/restoreConfirm.test.js — 「恢复默认」先 showModal 二次确认，确认后才清除；取消不清除 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const ts = fs.readFileSync(path.join(__dirname, '../miniprogram/pages/plan/plan.ts'), 'utf8');
const body = ts.slice(ts.indexOf('onRestoreDefault()'));
const fn = body.slice(0, body.indexOf('\n  },'));
const modal = fn.indexOf('wx.showModal(');
assert.ok(modal >= 0, '要有二次确认');
assert.ok(/confirmText: '恢复默认'/.test(fn) && /cancelText: '取消'/.test(fn));
const guard = fn.indexOf('if (!r.confirm) return;');
assert.ok(guard > modal, '取消直接返回');
for (const call of ['clearCustomSchedule()', 'clearDateOverrides()']) {
  const i = fn.indexOf(call);
  assert.ok(i > guard, `${call} 只在确认后执行`);
}
// 模拟：取消不清，确认才清
const run = (confirm) => {
  const calls = [];
  const wx = { showModal: (o) => o.success({ confirm }), showToast: () => calls.push('toast') };
  const page = { refresh: () => calls.push('refresh') };
  const src = fn.replace('onRestoreDefault()', 'function f()');
  new Function('wx', 'clearCustomSchedule', 'clearDateOverrides', `${src}\n  }\n  return f;`)(wx, () => calls.push('custom'), () => calls.push('ov')).call(page);
  return calls;
};
assert.deepStrictEqual(run(false), []);
assert.deepStrictEqual(run(true), ['custom', 'ov', 'refresh', 'toast']);
console.log('restoreConfirm.test ok');

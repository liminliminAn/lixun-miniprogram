/** node tests/figureError.test.js — 真机图解 P0：binderror 必须 console.warn 路径并显示文字兜底，不再静默整块隐藏 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '../miniprogram');
const W = require('./lib/warmup');
const warns = [];
const orig = console.warn; console.warn = (...a) => warns.push(a);
const r = W.onFigureError('/subpkg/exercises/a.jpg', { detail: { errMsg: 'boom' } });
console.warn = orig;
assert.deepStrictEqual(r, { showImg: false, imgFailed: true });
assert.strictEqual(warns[0][1], '/subpkg/exercises/a.jpg');
assert.strictEqual(warns[0][2], 'boom');
assert.deepStrictEqual(W.onFigureError('', null), { showImg: false, imgFailed: true });
assert.ok(W.IMG_FAIL_HINT.length > 0);
['detail', 'warmup-figure', 'posture-figure'].forEach((p) => {
  const wxml = fs.readFileSync(path.join(root, `subpkg/exercises/${p}/${p}.wxml`), 'utf8');
  const ts = fs.readFileSync(path.join(root, `subpkg/exercises/${p}/${p}.ts`), 'utf8');
  assert.ok(/binderror="onImgError"/.test(wxml), p + ' binderror');
  assert.ok(/wx:if="\{\{imgFailed\}\}"/.test(wxml), p + ' text fallback');
  assert.ok(/onFigureError\(/.test(ts), p + ' uses onFigureError');
  assert.ok(/imgFailed: false/.test(ts), p + ' init imgFailed');
});
console.log('figureError OK');

/** node tests/avatar.test.js — 头像按钮公共样式（登录页 / 我的页）守卫 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '../miniprogram');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const app = read('app.wxss');
const rule = (app.match(/\.avatar-btn, button\.avatar-btn:not\(\[size=mini\]\)\s*\{([^}]*)\}/) || [])[1];
assert.ok(rule, 'app.wxss 需有 .avatar-btn 公共规则（含 :not([size=mini]) 选择器）');
for (const d of ['padding: 0 !important', 'margin: 0 !important', 'width: 160rpx !important', 'height: 160rpx !important',
  'min-width: 0 !important', 'border-radius: 50% !important', 'overflow: hidden', 'line-height: normal !important', 'background: transparent !important']) {
  assert.ok(rule.includes(d), 'avatar-btn 缺少 ' + d);
}
assert.ok(/\.avatar-btn::after\s*\{\s*border:\s*none/.test(app));
assert.ok(/\.avatar-img\s*\{[^}]*width:\s*100%[^}]*height:\s*100%/.test(app));

for (const page of ['login', 'me']) {
  const wxml = read(`pages/${page}/${page}.wxml`);
  assert.ok(/<button class="avatar-btn" open-type="chooseAvatar"/.test(wxml), page + ' 用公共 avatar-btn');
  assert.ok(/<image class="avatar-img"[^>]*mode="aspectFill"/.test(wxml), page + ' 用公共 avatar-img + aspectFill');
  const wxss = read(`pages/${page}/${page}.wxss`);
  // 页面里不再重复定义尺寸/内边距
  assert.ok(!/^\.avatar-btn[ ,{]/m.test(wxss), page + '.wxss 不应重复定义 .avatar-btn');
  assert.ok(!/(^|\s)\.avatar(-img)?\s*\{/m.test(wxss), page + '.wxss 不应重复定义头像图');
  assert.ok(!/avatar-btn[^{]*\{[^}]*(width|padding|height)\s*:/.test(wxss), page + '.wxss 不应覆盖头像宽高/内边距');
}
console.log('avatar.test ok');

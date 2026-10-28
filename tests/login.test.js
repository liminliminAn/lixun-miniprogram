/** node tests/login.test.js — tests/lib/login.js 由 miniprogram/utils/login.ts 经 tsc 生成 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const L = require('./lib/login');

assert.deepStrictEqual(L.validateNickname('  阿力  '), { ok: true, value: '阿力' });
assert.strictEqual(L.validateNickname('   ').ok, false);
assert.strictEqual(L.validateNickname(undefined).ok, false);
assert.strictEqual(L.validateNickname('一'.repeat(20)).ok, true);
assert.strictEqual(L.validateNickname('一'.repeat(21)).ok, false);
assert.strictEqual(L.validateNickname('💪'.repeat(20)).ok, true); // 按字符计

const now = new Date('2026-10-28T00:00:00Z');
let u = L.buildUser({ nickname: ' 小明 ', avatarPath: 'wxfile://usr/a.png', now });
assert.deepStrictEqual(u, { nickname: '小明', avatarPath: 'wxfile://usr/a.png', agreedAt: '2026-10-28T00:00:00.000Z', version: 1, guest: false, openid: null });
u = L.buildUser({ now });
assert.strictEqual(u.avatarPath, L.DEFAULT_AVATAR);
const g = L.buildUser({ guest: true, nickname: 'x', now });
assert.ok(g.guest && g.nickname === L.DEFAULT_NICKNAME && g.openid === null);

assert.strictEqual(L.decideRoute(null, true), 'login');
assert.strictEqual(L.decideRoute({}, true), 'login');
assert.strictEqual(L.decideRoute(g, false), 'onboarding');
assert.strictEqual(L.decideRoute(g, true), 'ok');
assert.strictEqual(L.afterLoginUrl(false), '/pages/onboarding/onboarding');
assert.strictEqual(L.afterLoginUrl(true), '/pages/today/today');

assert.deepStrictEqual(L.keysToClear(['lixun:v1:user', 'lixun:v1:profile', 'other', 'lixun:v0:x']), ['lixun:v1:user', 'lixun:v1:profile']);
assert.strictEqual(L.isSavedAvatar(L.DEFAULT_AVATAR), false);
assert.strictEqual(L.isSavedAvatar('wxfile://usr/a.png'), true);
assert.strictEqual(L.isSavedAvatar(''), false);
assert.strictEqual(L.LOCAL_ONLY_COPY, '资料只保存在本机，换手机或删除小程序后会丢失');

// 配置与页面
const mp = path.join(__dirname, '../miniprogram');
const app = JSON.parse(fs.readFileSync(path.join(mp, 'app.json'), 'utf8'));
assert.ok(app.pages.includes('pages/login/login') && app.__usePrivacyCheck__ === true);
assert.strictEqual(app.pages[0], 'pages/today/today'); // tabBar 首页不变
const wxml = fs.readFileSync(path.join(mp, 'pages/login/login.wxml'), 'utf8');
assert.ok(/open-type="chooseAvatar"/.test(wxml) && /type="nickname"/.test(wxml) && /暂不登录，先试用/.test(wxml));
assert.ok(fs.statSync(path.join(mp, 'assets/default-avatar.png')).size < 5 * 1024);
console.log('login tests passed');

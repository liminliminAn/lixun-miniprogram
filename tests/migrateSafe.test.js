/** node tests/migrateSafe.test.js — 启动迁移删除 customSchedule 时存储抛错不阻断启动（登录跳转、隐私授权注册照常） */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const read = (p) => fs.readFileSync(path.join(__dirname, '../miniprogram', p), 'utf8');
const prof = read('services/profile.ts');
const body = prof.match(/export function migrateRemoveCustomSchedule\(\): void \{([\s\S]*?)\n\}/)[1];
const warns = [];
const fakeConsole = { warn: (...a) => warns.push(a) };
// wx.removeStorageSync 抛错 → storage.remove 抛错
const wx = { removeStorageSync: () => { throw new Error('storage broken'); } };
const storage = { remove: (k) => wx.removeStorageSync(k) };
const migrate = new Function('storage', 'LEGACY_CUSTOM_SCHEDULE_KEY', 'console', body).bind(null, storage, 'lixun:v1:customSchedule', fakeConsole);
assert.doesNotThrow(migrate);
assert.strictEqual(warns.length, 1, 'console.warn 记录错误');
// 模拟 onLaunch：迁移抛错后仍执行登录跳转和隐私授权注册
const app = read('app.ts');
const launch = app.match(/onLaunch\(\) \{([\s\S]*?)\n  \},/)[1];
const calls = [];
const wx2 = {
  removeStorageSync: () => { throw new Error('storage broken'); },
  reLaunch: (o) => calls.push(['reLaunch', o.url]),
  onNeedPrivacyAuthorization: () => calls.push(['privacy']),
};
const storage2 = { ensureDefaults: () => calls.push(['defaults']), remove: (k) => wx2.removeStorageSync(k) };
const migrate2 = new Function('storage', 'LEGACY_CUSTOM_SCHEDULE_KEY', 'console', body).bind(null, storage2, 'k', fakeConsole);
new Function('wx', 'storage', 'migrateRemoveCustomSchedule', 'launchRedirect', 'get', 'KEYS', 'isOnboardingDone', launch).call(
  { globalData: {} }, wx2, storage2, migrate2, () => '/pages/login/login', () => null, { user: 'u' }, () => false);
assert.deepStrictEqual(calls, [['defaults'], ['reLaunch', '/pages/login/login'], ['privacy']]);
console.log('migrateSafe.test ok');

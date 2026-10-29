/** node tests/warmupLiveLock.test.js — §3.4-11/12：勾选热身项立即写入会话并锁定今天；全部取消即解锁 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const W = require('./lib/warmup');
const S = require('./lib/schedule');
const s0 = { date: '2026-10-29', dayType: 'push', exercises: [{ exerciseId: 'bench', sets: [{ weight: 60, reps: 8, done: false }] }] };
assert.strictEqual(S.isTodayLocked(s0), false); // 只打开页面不锁
const s1 = W.withLiveChecked(s0, ['wu_1'], 'T');
assert.deepStrictEqual(s1.warmup.checked, ['wu_1']);
assert.strictEqual(s1.warmup.status, 'partial');
assert.strictEqual(S.isTodayLocked(s1), true); // 第一个勾选立即锁定
assert.strictEqual(s0.warmup, undefined); // 不改原对象
const s2 = W.withLiveChecked(s1, [], 'T2');
assert.strictEqual(S.isTodayLocked(s2), false); // 全部取消 → 解锁
assert.strictEqual(S.pinnedTodayType(['legs', 'legs', 'legs', 'legs', 'legs', 'legs', 'legs'], 3, s1), 'push');
const ts = fs.readFileSync(path.join(__dirname, '../miniprogram/pages/warmup/warmup.ts'), 'utf8');
assert.ok(/onToggleItem[\s\S]*?this\.persistChecked\(\);\s*\n\s*\},/.test(ts), 'onToggleItem 每次切换都落盘');
assert.ok(/persistChecked\(\)[\s\S]*withLiveChecked\(this\.session, this\.collectChecked\(\)\)[\s\S]*saveSession\(this\.session\)/.test(ts));
console.log('warmupLiveLock.test ok');

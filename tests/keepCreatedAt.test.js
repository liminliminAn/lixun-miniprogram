/** node tests/keepCreatedAt.test.js — 重做问卷保留原 createdAt，首次使用日不后移 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const P = require('./lib/persist');
const M = require('./lib/monthGrid');
const now = '2026-10-29T07:00:00.000Z';
assert.strictEqual(P.keepCreatedAt({ createdAt: '2026-08-15T02:00:00.000Z' }, now), '2026-08-15T02:00:00.000Z');
assert.strictEqual(P.keepCreatedAt(null, now), now);
assert.strictEqual(P.keepCreatedAt({}, now), now);
assert.strictEqual(P.keepCreatedAt({ createdAt: 'bad' }, now), now);
// 首次使用月不前移
assert.deepStrictEqual(M.monthOffsetRange('2026-10-29', M.firstUseDate(P.keepCreatedAt({ createdAt: new Date(2026, 7, 15, 10).toISOString() }, now), [], '2026-10-29')), { min: -2, max: 1 });
const ts = fs.readFileSync(path.join(__dirname, '../miniprogram/services/profile.ts'), 'utf8');
const fn = ts.slice(ts.indexOf('export function saveOnboarding'), ts.indexOf('export function getPlan'));
assert.ok(/createdAt: keepCreatedAt\(getProfile\(\), now\)/.test(fn) && !/createdAt: now/.test(fn));
console.log('keepCreatedAt.test ok');

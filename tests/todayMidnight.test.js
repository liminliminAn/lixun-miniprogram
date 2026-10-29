/** node tests/todayMidnight.test.js — 今日页开着跨零点时刷新：onShow 刷新 + 定时检查日期 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const ts = fs.readFileSync(path.join(__dirname, '../miniprogram/pages/today/today.ts'), 'utf8');

// 用桩跑 Page 逻辑：模拟时钟跨零点
let pageDef = null;
const timers = [];
const sandbox = {
  Page: (d) => { pageDef = d; },
  setInterval: (fn, ms) => { timers.push({ fn, ms, on: true }); return timers.length; },
  clearInterval: (id) => { if (timers[id - 1]) timers[id - 1].on = false; },
};
let now = '2026-10-29';
const mods = {
  '../../services/user': { guardEntry: () => true },
  '../../constants/crowds': { CROWDS: {} },
  '../../constants/templates': { DAY_TYPE_LABEL: { rest: '休', push: '推' } },
  '../../constants/exercises': { exercisesByDay: () => [] },
  '../../services/profile': { getProfile: () => null, getPlan: () => null, getPrefs: () => ({ restSoftWarnDays: 3 }) },
  '../../services/workout': { todayDayType: () => 'rest', consecutiveTrainDays: () => 0, getSession: () => undefined },
  '../../utils/date': { formatDate: () => now },
};
const ts2js = fs.readFileSync(path.join(__dirname, 'lib/todayPage.js'), 'utf8'); // tsc 编译自 pages/today/today.ts
assert.ok(ts2js.length > 0, '编译 today.ts');
const exportsObj = {};
new Function('require', 'exports', 'Page', 'setInterval', 'clearInterval', ts2js)((m) => mods[m], exportsObj, sandbox.Page, sandbox.setInterval, sandbox.clearInterval);
const page = Object.assign({ data: JSON.parse(JSON.stringify(pageDef.data)), setData(o) { Object.assign(this.data, o); } }, pageDef);
let refreshes = 0;
const origRefresh = page.refresh;
page.refresh = function () { refreshes++; return origRefresh.call(this); };

page.onShow();
assert.strictEqual(page.data.date, '2026-10-29');
assert.strictEqual(refreshes, 1);
const active = () => timers.filter((t) => t.on);
assert.strictEqual(active().length, 1);
assert.strictEqual(active()[0].ms, exportsObj.DATE_CHECK_MS);
active()[0].fn();
assert.strictEqual(refreshes, 1, '同一天不重复刷新');
now = '2026-10-30';
active()[0].fn();
assert.strictEqual(refreshes, 2, '跨零点后刷新');
assert.strictEqual(page.data.date, '2026-10-30');
// 再次 onShow 不叠加定时器；onHide 清理
page.onShow();
assert.strictEqual(active().length, 1);
page.onHide();
assert.strictEqual(active().length, 0);
page.onShow(); page.onUnload();
assert.strictEqual(active().length, 0);
assert.ok(/onShow\(\)[\s\S]*this\.refresh\(\)/.test(ts));
console.log('todayMidnight.test ok');

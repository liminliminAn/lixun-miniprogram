"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAST_NO_RECORD_LABEL = exports.STREAK_SOFT_TIP = exports.STREAK_SOFT_LIMIT = exports.TODAY_LOCKED_TIP = exports.DAY_KIND_SHEET = exports.DAY_KINDS = void 0;
exports.isValidWeek = isValidWeek;
exports.effectiveWeek = effectiveWeek;
exports.setDay = setDay;
exports.isCustomized = isCustomized;
exports.clampWeekOffset = clampWeekOffset;
exports.weekDates = weekDates;
exports.shortDate = shortDate;
exports.dayTense = dayTense;
exports.canEditDay = canEditDay;
exports.isTrained = isTrained;
exports.buildWeekCells = buildWeekCells;
exports.tapAction = tapAction;
exports.sessionSummary = sessionSummary;
exports.restoreDecision = restoreDecision;
exports.isTodayLocked = isTodayLocked;
exports.maxConsecutiveTraining = maxConsecutiveTraining;
exports.streakSoftTip = streakSoftTip;
exports.pinnedTodayType = pinnedTodayType;
exports.DAY_KINDS = ['push', 'pull', 'legs', 'rest'];
exports.DAY_KIND_SHEET = ['推', '拉', '腿', '休'];
function isValidWeek(week) {
    return Array.isArray(week) && week.length === 7 && week.every((d) => exports.DAY_KINDS.indexOf(d) >= 0);
}
/** 生效课表：自定义合法则用自定义，否则用默认 plan.week */
function effectiveWeek(defaultWeek, custom) {
    if (custom && isValidWeek(custom.week))
        return [...custom.week];
    if (isValidWeek(defaultWeek))
        return [...defaultWeek];
    return ['rest', 'rest', 'rest', 'rest', 'rest', 'rest', 'rest'];
}
/** 改某一天，返回新的自定义课表（以当前生效课表为底） */
function setDay(base, idx, kind, now = new Date()) {
    const week = [...base];
    if (idx >= 0 && idx < 7 && exports.DAY_KINDS.indexOf(kind) >= 0)
        week[idx] = kind;
    return { week, updatedAt: now.toISOString() };
}
function isCustomized(custom) {
    return !!(custom && isValidWeek(custom.week));
}
/* ---------- 周视图：日期、翻周、完成标记、过去日禁改 ---------- */
const pad = (n) => `${n}`.padStart(2, '0');
function parse(s) {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
}
function fmt(d) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
/** 不能翻到本周之后：offset 只允许 ≤ 0 */
function clampWeekOffset(offset) {
    const n = Math.trunc(Number(offset) || 0);
    return n > 0 ? 0 : n;
}
/** today 所在周（周一起）偏移 offset 周后的 7 天 YYYY-MM-DD */
function weekDates(today, offset = 0) {
    const t = parse(today);
    const js = t.getDay();
    const mon = new Date(t.getFullYear(), t.getMonth(), t.getDate() - (js === 0 ? 6 : js - 1) + clampWeekOffset(offset) * 7);
    return Array.from({ length: 7 }, (_, i) => fmt(new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + i)));
}
/** M/D，如 10/27 */
function shortDate(date) {
    const [, m, d] = date.split('-').map(Number);
    return `${m}/${d}`;
}
function dayTense(date, today) {
    return date < today ? 'past' : date === today ? 'today' : 'future';
}
/** 过去日不能改课表类型；今天及以后可以 */
function canEditDay(date, today) {
    return dayTense(date, today) !== 'past';
}
/** 只认带 completedAt 的记录 */
function isTrained(s) {
    return !!(s && s.completedAt);
}
function buildWeekCells(week, today, offset, sessions) {
    return weekDates(today, offset).map((date, idx) => {
        const tense = dayTense(date, today);
        const s = sessions[date];
        const recorded = tense === 'past' && s && s.dayType && exports.DAY_KINDS.indexOf(s.dayType) >= 0 ? s.dayType : null;
        return {
            idx,
            date,
            md: shortDate(date),
            dayType: tense === 'past' ? recorded || 'rest' : pinnedTodayType(week, idx, tense === 'today' ? s : null),
            tense,
            isToday: tense === 'today',
            trained: isTrained(s),
            hasRecord: !!s,
            noRecord: tense === 'past' && !recorded,
            // §3.4-4：今天已开练或已完成（当天有任何记录）→ 锁定类型
            editable: canEditDay(date, today) && !(tense === 'today' && !!s),
        };
    });
}
/** 点格子后的动作：可改 → ActionSheet；过去日有记录 → 看记录；否则 toast */
function tapAction(cell) {
    if (cell.editable)
        return 'edit';
    if (cell.isToday)
        return 'locked';
    return cell.hasRecord ? 'record' : 'none';
}
/** 过去某天记录的文字摘要（复用 sessions 数据，弹窗展示） */
function sessionSummary(s, nameOf) {
    const lines = (s.exercises || [])
        .filter((e) => e.sets && e.sets.length)
        .map((e) => `${nameOf(e.exerciseId)}：${e.sets.map((x) => `${x.weight || 0}kg×${x.reps || 0}`).join('、')}`);
    const head = s.completedAt ? '已完成' : '未完成';
    return lines.length ? `${head}\n${lines.join('\n')}` : `${head}（无组记录）`;
}
/** 开练时对当日已有记录的处理：只恢复与生效类型一致的未完成记录 */
function restoreDecision(existing, dayType) {
    if (!existing)
        return 'fresh';
    if (isTrained(existing))
        return 'completed';
    return existing.dayType === dayType ? 'restore' : 'fresh';
}
/** §3.4-4：今天有任何记录（开练或完成）→ 锁定，不能改类型 */
function isTodayLocked(todaySession) {
    return !!todaySession;
}
exports.TODAY_LOCKED_TIP = '今天已开练，训练类型已锁定';
/** 最长连续训练天数（周日→周一循环计算）；全训练返回 7 */
function maxConsecutiveTraining(week) {
    if (week.every((d) => d !== 'rest'))
        return week.length;
    let best = 0;
    let run = 0;
    for (let i = 0; i < week.length * 2; i++) {
        run = week[i % week.length] !== 'rest' ? run + 1 : 0;
        best = Math.max(best, run);
    }
    return Math.min(best, week.length);
}
exports.STREAK_SOFT_LIMIT = 3;
exports.STREAK_SOFT_TIP = '已连续训练超过 3 天，注意安排休息';
/** §3.4-6：连续训练 >3 天只软提示，不拦截 */
function streakSoftTip(week) {
    return maxConsecutiveTraining(week) > exports.STREAK_SOFT_LIMIT ? exports.STREAK_SOFT_TIP : '';
}
exports.PAST_NO_RECORD_LABEL = '未训练/休息';
/**
 * §3.4-8：今天已有记录（开练或完成）时，今天类型固定为记录的类型；
 * 恢复默认 / 改天数 / 重做问卷只从明天起生效。无记录则按生效课表。
 * 记录按日期存储，日期一过自然失效，无需单独的 pin key。
 */
function pinnedTodayType(week, idx, todaySession) {
    if (todaySession && todaySession.dayType && exports.DAY_KINDS.indexOf(todaySession.dayType) >= 0)
        return todaySession.dayType;
    return week[idx] || 'rest';
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STREAK_LOOKBACK_DAYS = exports.PAST_REST_LABEL = exports.PAST_NO_RECORD_LABEL = exports.STREAK_SOFT_TIP = exports.STREAK_SOFT_LIMIT = exports.TODAY_LOCKED_TIP = exports.DAY_KIND_SHEET = exports.DAY_KINDS = void 0;
exports.isValidWeek = isValidWeek;
exports.planWeek = planWeek;
exports.clampWeekOffset = clampWeekOffset;
exports.weekDates = weekDates;
exports.shortDate = shortDate;
exports.dayTense = dayTense;
exports.canEditDay = canEditDay;
exports.isStarted = isStarted;
exports.isTrained = isTrained;
exports.buildWeekCells = buildWeekCells;
exports.tapAction = tapAction;
exports.sessionSummary = sessionSummary;
exports.restoreDecision = restoreDecision;
exports.isTodayLocked = isTodayLocked;
exports.pinnedTodayType = pinnedTodayType;
exports.weekWithTodayPinned = weekWithTodayPinned;
exports.resolveDayType = resolveDayType;
exports.resolveDates = resolveDates;
exports.dropOverridesFrom = dropOverridesFrom;
exports.rescheduleContent = rescheduleContent;
exports.pruneOverrides = pruneOverrides;
exports.withOverride = withOverride;
exports.hasOverrideIn = hasOverrideIn;
exports.pinType = pinType;
exports.pinnedResolvedDays = pinnedResolvedDays;
exports.streakDays = streakDays;
exports.maxConsecutiveLinear = maxConsecutiveLinear;
exports.maxRunReaching = maxRunReaching;
exports.streakTodayIndex = streakTodayIndex;
exports.streakSoftTipDays = streakSoftTipDays;
exports.overrideSheetTitle = overrideSheetTitle;
exports.DAY_KINDS = ['push', 'pull', 'legs', 'rest'];
exports.DAY_KIND_SHEET = ['推', '拉', '腿', '休'];
function isValidWeek(week) {
    return Array.isArray(week) && week.length === 7 && week.every((d) => exports.DAY_KINDS.indexOf(d) >= 0);
}
/** 默认课表（问卷生成的 plan.week）；不合法时全休 */
function planWeek(defaultWeek) {
    if (isValidWeek(defaultWeek))
        return [...defaultWeek];
    return ['rest', 'rest', 'rest', 'rest', 'rest', 'rest', 'rest'];
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
/** §3.4-9：已开练 = 记下至少一组（done）或勾选至少一个热身项；已完成也算。只打开页面产生的空草稿不算 */
function isStarted(s) {
    if (!s)
        return false;
    if (s.completedAt)
        return true;
    if (s.warmup && Array.isArray(s.warmup.checked) && s.warmup.checked.length > 0)
        return true;
    return (s.exercises || []).some((e) => (e.sets || []).some((x) => !!x.done));
}
/** 只认带 completedAt 的记录（点了「完成训练」才算练过；未完成草稿不计入连练） */
function isTrained(s) {
    return !!(s && s.completedAt);
}
function buildWeekCells(week, today, offset, sessions, overrides = null) {
    return weekDates(today, offset).map((date, idx) => {
        const tense = dayTense(date, today);
        const raw = sessions[date];
        // §3.4-9：空草稿视同无记录
        const s = isStarted(raw) ? raw : undefined;
        const recorded = tense === 'past' && s && s.dayType && exports.DAY_KINDS.indexOf(s.dayType) >= 0 ? s.dayType : null;
        return {
            idx,
            date,
            md: shortDate(date),
            dayType: tense === 'past' ? recorded || 'rest' : pinType(resolveDayType(date, week, overrides), tense === 'today' ? s : null),
            tense,
            isToday: tense === 'today',
            trained: isTrained(s),
            hasRecord: !!s,
            noRecord: tense === 'past' && !recorded,
            // §3.4-4/9：今天已开练（记下一组或勾选热身）或已完成 → 锁定类型
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
    return isStarted(todaySession);
}
exports.TODAY_LOCKED_TIP = '今天已开练，训练类型已锁定';
/** 最长连续训练天数（周日→周一循环计算）；全训练返回 7 */
exports.STREAK_SOFT_LIMIT = 3;
exports.STREAK_SOFT_TIP = '已连续训练超过 3 天，注意安排休息';
exports.PAST_NO_RECORD_LABEL = '未训练/休息';
/** 周视图、月历格子：过去无记录统一显示单字「休」（深灰）；记录弹窗保留全称 */
exports.PAST_REST_LABEL = '休';
/**
 * §3.4-8：今天已有记录（开练或完成）时，今天类型固定为记录的类型；
 * 恢复默认 / 改天数 / 重做问卷只从明天起生效。无记录则按生效课表。
 * 记录按日期存储，日期一过自然失效，无需单独的 pin key。
 */
function pinnedTodayType(week, idx, todaySession) {
    if (isStarted(todaySession) && todaySession && todaySession.dayType && exports.DAY_KINDS.indexOf(todaySession.dayType) >= 0)
        return todaySession.dayType;
    return week[idx] || 'rest';
}
/** 今天按 §3.4-8/9 固定后的生效周课表（连练软提示等按实际今天类型计算） */
function weekWithTodayPinned(week, todayIdx, todaySession) {
    const out = [...week];
    out[todayIdx] = pinnedTodayType(week, todayIdx, todaySession);
    return out;
}
function mondayIdxOf(date) {
    const js = parse(date).getDay();
    return js === 0 ? 6 : js - 1;
}
/** 某天生效类型：日期覆盖 → 问卷默认课表（week） */
function resolveDayType(date, week, overrides) {
    const o = overrides && overrides[date];
    if (o && exports.DAY_KINDS.indexOf(o) >= 0)
        return o;
    return week[mondayIdxOf(date)] || 'rest';
}
/** 一组日期的生效类型 */
function resolveDates(dates, week, overrides) {
    return dates.map((d) => resolveDayType(d, week, overrides));
}
/** 去掉今天之前的覆盖（过去日不可改，留着无用） */
/** 去掉今天及以后的覆盖（过去的只作记录，保留） */
function dropOverridesFrom(overrides, today) {
    const out = {};
    Object.keys(overrides || {}).forEach((d) => {
        if (d < today)
            out[d] = overrides[d];
    });
    return out;
}
/** 重排弹窗正文：N>0 时追加「将清除 N 个按日修改」 */
function rescheduleContent(base, n) {
    return n > 0 ? `${base}\n将清除 ${n} 个按日修改` : base;
}
function pruneOverrides(overrides, today) {
    const out = {};
    Object.keys(overrides || {}).forEach((d) => {
        const v = overrides[d];
        if (d >= today && exports.DAY_KINDS.indexOf(v) >= 0)
            out[d] = v;
    });
    return out;
}
/** 写入某天的覆盖（顺带清理过去的覆盖）；过去日不写 */
function withOverride(overrides, date, kind, today) {
    const out = pruneOverrides(overrides, today);
    if (date >= today && exports.DAY_KINDS.indexOf(kind) >= 0)
        out[date] = kind;
    return out;
}
/** 这些日期里是否有覆盖生效 */
function hasOverrideIn(overrides, dates) {
    return dates.some((d) => !!(overrides && overrides[d] && exports.DAY_KINDS.indexOf(overrides[d]) >= 0));
}
/** 今天已开练 → 固定为记录类型；否则用计划类型（§3.4-8/9） */
function pinType(planned, todaySession) {
    if (isStarted(todaySession) && todaySession && todaySession.dayType && exports.DAY_KINDS.indexOf(todaySession.dayType) >= 0)
        return todaySession.dayType;
    return planned;
}
/** 具体日期序列（本周一 → 下周日，14 天）：覆盖 → 模板，今天按开练记录固定。不做循环拼接 */
function pinnedResolvedDays(week, today, overrides, todaySession, sessions) {
    const sun = parse(weekDates(today, 0)[6]);
    const nextMon = fmt(new Date(sun.getFullYear(), sun.getMonth(), sun.getDate() + 1));
    return weekDates(today, 0).concat(weekDates(nextMon, 0)).map((d) => {
        // P3-A：传入记录时，过去日按实际记录（已开练或 completedAt 才算训练，与 BUG-02 一致），漏练算休
        if (sessions && d < today) {
            return actualKind(sessions[d]);
        }
        const t = resolveDayType(d, week, overrides);
        return d === today ? pinType(t, todaySession) : t;
    });
}
/** 往前回看的天数（上周五~周日） */
exports.STREAK_LOOKBACK_DAYS = 3;
/** 过去某天是否算训练：按实际记录（开练或 completedAt，与 BUG-02 一致） */
function actualKind(s) {
    return isStarted(s) ? (s && s.dayType && exports.DAY_KINDS.indexOf(s.dayType) >= 0 ? s.dayType : 'push') : 'rest';
}
/** 连练序列：上周五~周日（实际记录）+ 本周一~下周日（pinnedResolvedDays），跨周连续计算 */
function streakDays(week, today, overrides, todaySession, sessions) {
    const mon = parse(weekDates(today, 0)[0]);
    const back = [];
    for (let i = exports.STREAK_LOOKBACK_DAYS; i >= 1; i--) {
        const d = fmt(new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() - i));
        back.push(actualKind((sessions || {})[d]));
    }
    return back.concat(pinnedResolvedDays(week, today, overrides, todaySession, sessions || {}));
}
/** 线性最长连续训练天数（具体日期，周日不接回本周一） */
function maxConsecutiveLinear(days) {
    let best = 0;
    let run = 0;
    days.forEach((d) => {
        run = d !== 'rest' ? run + 1 : 0;
        best = Math.max(best, run);
    });
    return best;
}
/** 线性最长连续训练天数，只计「结束位置 ≥ fromIdx」的连练（P3-C：含今天或未来日的连练） */
function maxRunReaching(days, fromIdx) {
    let best = 0;
    let run = 0;
    for (let i = 0; i <= days.length; i++) {
        if (i < days.length && days[i] !== 'rest') {
            run += 1;
            continue;
        }
        if (i - 1 >= fromIdx)
            best = Math.max(best, run);
        run = 0;
    }
    return best;
}
/** streakDays 序列里今天的下标（回看 3 天 + 本周第几天） */
function streakTodayIndex(today) {
    return exports.STREAK_LOOKBACK_DAYS + weekDates(today, 0).indexOf(today);
}
/** 周视图软提示：按具体日期线性计算；fromIdx 为今天下标时，已结束的过去连练不提示 */
function streakSoftTipDays(days, fromIdx = 0) {
    return maxRunReaching(days, fromIdx) > exports.STREAK_SOFT_LIMIT ? exports.STREAK_SOFT_TIP : '';
}
/** 「修改 M/D」 */
function overrideSheetTitle(date) {
    return `修改 ${shortDate(date)}`;
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MONTH_WEEKDAY_HEADER = void 0;
exports.shiftMonth = shiftMonth;
exports.firstUseDate = firstUseDate;
exports.monthOffsetRange = monthOffsetRange;
exports.clampMonthOffset = clampMonthOffset;
exports.monthTitle = monthTitle;
exports.monthDates = monthDates;
exports.buildMonthCells = buildMonthCells;
exports.editSheetTitle = editSheetTitle;
/** 计划页整月日历（纯函数，便于单测）：6 行 × 7 列，周一起 */
const schedule_1 = require("./schedule");
exports.MONTH_WEEKDAY_HEADER = ['一', '二', '三', '四', '五', '六', '日'];
const KIND_LABEL = { push: '推', pull: '拉', legs: '腿', rest: '休' };
const pad = (n) => `${n}`.padStart(2, '0');
const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
/** 由 today 所在月偏移 offset 个月 → { year, month(1-12) } */
function shiftMonth(today, offset) {
    const [y, m] = today.split('-').map(Number);
    const d = new Date(y, m - 1 + Math.trunc(Number(offset) || 0), 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
}
/** 首次使用日：档案创建日（本地日期）与最早一条会话日期中较早者；都没有则为 today */
function firstUseDate(createdAt, sessionDates, today) {
    const c = [];
    if (createdAt) {
        const d = new Date(createdAt);
        if (!isNaN(d.getTime()))
            c.push(fmt(d));
    }
    sessionDates.forEach((x) => /^\d{4}-\d{2}-\d{2}$/.test(x) && c.push(x));
    c.push(today);
    return c.sort()[0];
}
/** §3.5-2：翻月范围 —— 最早到首次使用那个月，最晚到下个月 */
function monthOffsetRange(today, firstUse) {
    const [ty, tm] = today.split('-').map(Number);
    const [fy, fm] = firstUse.split('-').map(Number);
    return { min: Math.min(0, (fy - ty) * 12 + (fm - tm)), max: 1 };
}
function clampMonthOffset(offset, range) {
    const n = Math.trunc(Number(offset) || 0);
    return Math.max(range.min, Math.min(range.max, n));
}
function monthTitle(year, month) {
    return `${year}年${month}月`;
}
/** 42 个日期（周一起），month 为 1-12 */
function monthDates(year, month) {
    const first = new Date(year, month - 1, 1);
    const js = first.getDay();
    const lead = js === 0 ? 6 : js - 1;
    return Array.from({ length: 42 }, (_, i) => fmt(new Date(year, month - 1, 1 - lead + i)));
}
function buildMonthCells(year, month, today, week, sessions) {
    return monthDates(year, month).map((date, i) => {
        const [, m, d] = date.split('-').map(Number);
        const weekdayIdx = i % 7;
        const tense = (0, schedule_1.dayTense)(date, today);
        const raw = sessions[date];
        const s = (0, schedule_1.isStarted)(raw) ? raw : undefined; // §3.4-9 空草稿视同无记录
        const trained = (0, schedule_1.isTrained)(s);
        let dayType;
        let label;
        if (tense === 'past') {
            // §3.4-7：过去日只显示实际记录
            dayType = s && s.dayType && schedule_1.DAY_KINDS.indexOf(s.dayType) >= 0 ? s.dayType : null;
            label = trained ? '✓已练' : dayType ? KIND_LABEL[dayType] : schedule_1.PAST_NO_RECORD_LABEL;
        }
        else {
            dayType = (0, schedule_1.pinnedTodayType)(week, weekdayIdx, tense === 'today' ? s : null);
            label = KIND_LABEL[dayType];
        }
        return {
            date,
            day: d,
            inMonth: m === month,
            isToday: tense === 'today',
            tense,
            weekdayIdx,
            dayType,
            label,
            trained,
            hasRecord: !!s,
            noRecord: tense === 'past' && !dayType,
            editable: tense !== 'past' && !(tense === 'today' && !!s),
        };
    });
}
/** ActionSheet 标题：课表按星期存储，改一天即改每周这一天 */
function editSheetTitle(weekdayIdx) {
    return `修改每周${exports.MONTH_WEEKDAY_HEADER[weekdayIdx] || ''}`;
}

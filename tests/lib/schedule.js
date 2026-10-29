"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DAY_KIND_SHEET = exports.DAY_KINDS = void 0;
exports.isValidWeek = isValidWeek;
exports.effectiveWeek = effectiveWeek;
exports.setDay = setDay;
exports.isCustomized = isCustomized;
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

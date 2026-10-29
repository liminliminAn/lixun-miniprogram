"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WEEKDAY_LABELS = exports.DAY_TYPE_LABEL = exports.WEEK_TEMPLATES = exports.DAYS_PER_WEEK_OPTIONS = void 0;
exports.isDaysPerWeek = isDaysPerWeek;
exports.buildWeekPlan = buildWeekPlan;
/**
 * 周历模板（周一 → 周日）
 * 4 练：推,拉,腿,休,拉,休,休（去掉第二次推；周内第二次训练日类型为拉）
 * 5 练：推,拉,腿,休,推,拉,休
 * 3 练：推,休,拉,休,腿,休,休
 */
exports.DAYS_PER_WEEK_OPTIONS = [3, 4, 5];
exports.WEEK_TEMPLATES = {
    3: ['push', 'rest', 'pull', 'rest', 'legs', 'rest', 'rest'],
    4: ['push', 'pull', 'legs', 'rest', 'pull', 'rest', 'rest'],
    5: ['push', 'pull', 'legs', 'rest', 'push', 'pull', 'rest'],
};
exports.DAY_TYPE_LABEL = {
    push: '推',
    pull: '拉',
    legs: '腿',
    rest: '休',
};
exports.WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];
function isDaysPerWeek(n) {
    return n === 3 || n === 4 || n === 5;
}
function buildWeekPlan(daysPerWeek) {
    return {
        daysPerWeek,
        week: [...exports.WEEK_TEMPLATES[daysPerWeek]],
        updatedAt: new Date().toISOString(),
    };
}

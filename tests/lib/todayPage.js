"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DATE_CHECK_MS = void 0;
const user_1 = require("../../services/user");
const crowds_1 = require("../../constants/crowds");
const templates_1 = require("../../constants/templates");
const exercises_1 = require("../../constants/exercises");
const profile_1 = require("../../services/profile");
const workout_1 = require("../../services/workout");
const date_1 = require("../../utils/date");
/** 跨零点检测间隔（页面显示期间） */
exports.DATE_CHECK_MS = 60 * 1000;
let dateTimer = null;
Page({
    data: {
        /** BUG-D：路由校验通过前不渲染 */
        ready: false,
        date: '',
        dayType: 'rest',
        dayLabel: '休',
        isRest: true,
        exercises: [],
        crowdName: '',
        daysPerWeek: 4,
        streak: 0,
        restSoftWarnDays: 3,
    },
    onShow() {
        if (!(0, user_1.guardEntry)())
            return;
        if (!this.data.ready)
            this.setData({ ready: true });
        this.refresh();
        this.startDateWatch();
    },
    onHide() {
        this.stopDateWatch();
    },
    onUnload() {
        this.stopDateWatch();
    },
    /** 页面开着跨过零点时自动刷新到新的一天 */
    startDateWatch() {
        this.stopDateWatch();
        dateTimer = setInterval(() => this.checkDateChange(), exports.DATE_CHECK_MS);
    },
    stopDateWatch() {
        if (dateTimer !== null) {
            clearInterval(dateTimer);
            dateTimer = null;
        }
    },
    checkDateChange() {
        if (this.data.date && this.data.date !== (0, date_1.formatDate)())
            this.refresh();
    },
    refresh() {
        const date = (0, date_1.formatDate)();
        const dayType = (0, workout_1.todayDayType)();
        const profile = (0, profile_1.getProfile)();
        const plan = (0, profile_1.getPlan)();
        const prefs = (0, profile_1.getPrefs)();
        const exercises = dayType === 'rest' ? [] : (0, exercises_1.exercisesByDay)(dayType);
        this.setData({
            date,
            dayType,
            dayLabel: templates_1.DAY_TYPE_LABEL[dayType],
            isRest: dayType === 'rest',
            exercises,
            crowdName: profile ? crowds_1.CROWDS[profile.crowd].name : '',
            daysPerWeek: (plan === null || plan === void 0 ? void 0 : plan.daysPerWeek) || (profile === null || profile === void 0 ? void 0 : profile.daysPerWeek) || 4,
            streak: (0, workout_1.consecutiveTrainDays)(date),
            restSoftWarnDays: prefs.restSoftWarnDays,
        });
    },
    onStart() {
        if (this.data.isRest)
            return;
        const s = (0, workout_1.getSession)((0, date_1.formatDate)());
        const needWarmup = (0, profile_1.getPrefs)().showWarmup !== false && !(s && s.warmup);
        wx.navigateTo({ url: needWarmup ? '/pages/warmup/warmup' : '/pages/session/session' });
    },
});

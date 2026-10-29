import { guardEntry } from '../../services/user';
import { CROWDS } from '../../constants/crowds';
import { DAY_TYPE_LABEL } from '../../constants/templates';
import { exercisesByDay } from '../../constants/exercises';
import { getProfile, getPlan, getPrefs } from '../../services/profile';
import { todayDayType, consecutiveTrainDays, getSession } from '../../services/workout';
import { formatDate } from '../../utils/date';

/** 跨零点检测间隔（页面显示期间） */
export const DATE_CHECK_MS = 60 * 1000;
let dateTimer: number | null = null;

Page({
  data: {
    /** BUG-D：路由校验通过前不渲染 */
    ready: false,
    date: '',
    dayType: 'rest' as DayType,
    dayLabel: '休',
    isRest: true,
    exercises: [] as any[],
    crowdName: '',
    daysPerWeek: 4,
    streak: 0,
    restSoftWarnDays: 3,
  },
  onShow() {
    if (!guardEntry()) return;
    if (!this.data.ready) this.setData({ ready: true });
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
    dateTimer = setInterval(() => this.checkDateChange(), DATE_CHECK_MS) as unknown as number;
  },
  stopDateWatch() {
    if (dateTimer !== null) {
      clearInterval(dateTimer);
      dateTimer = null;
    }
  },
  checkDateChange() {
    if (this.data.date && this.data.date !== formatDate()) this.refresh();
  },
  refresh() {
    const date = formatDate();
    const dayType = todayDayType();
    const profile = getProfile();
    const plan = getPlan();
    const prefs = getPrefs();
    const exercises =
      dayType === 'rest' ? [] : exercisesByDay(dayType);
    this.setData({
      date,
      dayType,
      dayLabel: DAY_TYPE_LABEL[dayType],
      isRest: dayType === 'rest',
      exercises,
      crowdName: profile ? CROWDS[profile.crowd].name : '',
      daysPerWeek: plan?.daysPerWeek || profile?.daysPerWeek || 4,
      streak: consecutiveTrainDays(date),
      restSoftWarnDays: prefs.restSoftWarnDays,
    });
  },
  onStart() {
    if (this.data.isRest) return;
    const s = getSession(formatDate());
    const needWarmup = getPrefs().showWarmup !== false && !(s && s.warmup);
    wx.navigateTo({ url: needWarmup ? '/pages/warmup/warmup' : '/pages/session/session' });
  },
});

import { guardEntry } from '../../services/user';
import { CROWDS } from '../../constants/crowds';
import { DAY_TYPE_LABEL } from '../../constants/templates';
import { exercisesByDay } from '../../constants/exercises';
import { getProfile, getPlan, getPrefs } from '../../services/profile';
import { todayDayType, consecutiveTrainDays, getSession } from '../../services/workout';
import { formatDate } from '../../utils/date';

Page({
  data: {
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
    this.refresh();
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

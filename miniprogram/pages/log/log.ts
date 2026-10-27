import { listBodyWeights, addBodyWeight } from '../../services/body';
import { getPrefs, isOnboardingDone } from '../../services/profile';
import { getSessions, consecutiveTrainDays } from '../../services/workout';
import { DAY_TYPE_LABEL } from '../../constants/templates';
import { formatDate } from '../../utils/date';

Page({
  data: {
    weightInput: '',
    weights: [] as BodyWeightEntry[],
    recentSessions: [] as any[],
    streak: 0,
    restSoftWarnDays: 3,
  },
  onShow() {
    if (!isOnboardingDone()) {
      wx.redirectTo({ url: '/pages/onboarding/onboarding' });
      return;
    }
    this.refresh();
  },
  refresh() {
    const prefs = getPrefs();
    const sessions = getSessions();
    const recentSessions = Object.keys(sessions)
      .sort()
      .reverse()
      .slice(0, 10)
      .map((date) => ({
        date,
        label: DAY_TYPE_LABEL[sessions[date].dayType],
        completed: !!sessions[date].completedAt,
      }));
    this.setData({
      weights: listBodyWeights(),
      recentSessions,
      streak: consecutiveTrainDays(),
      restSoftWarnDays: prefs.restSoftWarnDays,
    });
  },
  onWeightInput(e: any) {
    this.setData({ weightInput: e.detail.value });
  },
  onAddWeight() {
    const kg = parseFloat(this.data.weightInput);
    if (!kg) {
      wx.showToast({ title: '请输入体重', icon: 'none' });
      return;
    }
    addBodyWeight(kg, formatDate());
    this.setData({ weightInput: '' });
    wx.showToast({ title: '已记录', icon: 'success' });
    this.refresh();
  },
});

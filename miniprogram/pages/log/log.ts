import { guardEntry } from '../../services/user';
import { listBodyWeights, addBodyWeight } from '../../services/body';
import { getPrefs, getProfile } from '../../services/profile';
import { buildWeightTrend, WeightTrendView } from '../../utils/weightTrend';
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
    trend: null as WeightTrendView | null,
    chartList: [] as any[],
    weeklyText: '',
  },
  onShow() {
    if (!guardEntry()) return;
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
    const weights = listBodyWeights();
    const profile = getProfile();
    const trend = buildWeightTrend(weights, formatDate(), profile ? profile.crowd : 'recomp');
    const maMap: Record<string, number> = {};
    (trend.ma || []).forEach((m) => (maMap[m.date] = m.ma));
    const chartList = weights.map((w) => ({ ...w, ma: maMap[w.date] }));
    const wc = trend.weeklyChange;
    const weeklyText = wc === null ? '' : `${wc > 0 ? '+' : ''}${wc} kg`;
    this.setData({
      trend,
      chartList,
      weeklyText,
      weights,
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

import { CROWDS } from '../../constants/crowds';
import { getProfile, getPrefs, setPrefs, isOnboardingDone } from '../../services/profile';
import { KEYS, remove } from '../../services/storage';

Page({
  data: {
    profile: null as UserProfile | null,
    crowdName: '',
    restSoftWarnDays: 3,
    showWarmup: true,
  },
  onShow() {
    if (!isOnboardingDone()) {
      wx.redirectTo({ url: '/pages/onboarding/onboarding' });
      return;
    }
    const profile = getProfile();
    const prefs = getPrefs();
    this.setData({
      profile,
      crowdName: profile ? CROWDS[profile.crowd].name : '',
      restSoftWarnDays: prefs.restSoftWarnDays,
      showWarmup: prefs.showWarmup !== false,
    });
  },
  onWarmupChange(e: any) {
    const v = !!e.detail.value;
    setPrefs({ showWarmup: v });
    this.setData({ showWarmup: v });
  },
  onReset() {
    wx.showModal({
      title: '确认清除？',
      content: '将删除本地档案、课表、训练与体重记录。',
      success: (res) => {
        if (!res.confirm) return;
        Object.values(KEYS).forEach((k) => remove(k));
        wx.reLaunch({ url: '/pages/onboarding/onboarding' });
      },
    });
  },
});

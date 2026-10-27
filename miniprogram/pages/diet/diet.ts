import { CROWDS } from '../../constants/crowds';
import { getProfile, isOnboardingDone } from '../../services/profile';

Page({
  data: {
    crowd: null as any,
  },
  onShow() {
    if (!isOnboardingDone()) {
      wx.redirectTo({ url: '/pages/onboarding/onboarding' });
      return;
    }
    const profile = getProfile();
    this.setData({
      crowd: profile ? CROWDS[profile.crowd] : null,
    });
  },
});

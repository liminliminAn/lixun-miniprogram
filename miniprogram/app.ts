import { storage } from './services/storage';

App<IAppOption>({
  globalData: {
    version: '0.1.0',
  },
  onLaunch() {
    storage.ensureDefaults();
    // IT2-07 隐私授权：低版本基础库无此 API 时跳过
    if (typeof wx.onNeedPrivacyAuthorization === 'function') {
      wx.onNeedPrivacyAuthorization((resolve) => {
        this.globalData.privacyResolve = resolve;
        if (this.globalData.onPrivacyNeeded) this.globalData.onPrivacyNeeded();
        else resolve({ event: 'disagree' });
      });
    }
  },
});

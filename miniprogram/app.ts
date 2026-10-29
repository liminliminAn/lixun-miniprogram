import { storage, KEYS, get } from './services/storage';
import { isOnboardingDone, migrateRemoveCustomSchedule } from './services/profile';
import { launchRedirect } from './utils/login';

App<IAppOption>({
  globalData: {
    version: '0.1.0',
  },
  onLaunch() {
    storage.ensureDefaults();
    // 周模板层已移除：删除遗留 lixun:v1:customSchedule
    migrateRemoveCustomSchedule();
    // BUG-D：首个 Tab 渲染前判定，避免「今日」闪屏
    const to = launchRedirect(get(KEYS.user, null), isOnboardingDone());
    if (to) wx.reLaunch({ url: to });
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

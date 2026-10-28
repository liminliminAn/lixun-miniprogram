import { isOnboardingDone } from '../../services/profile';
import { saveUser, persistAvatar } from '../../services/user';
import { buildUser, validateNickname, afterLoginUrl, DEFAULT_AVATAR, LOCAL_ONLY_COPY, NICKNAME_MAX } from '../../utils/login';

Page({
  data: {
    avatarPath: DEFAULT_AVATAR,
    nickname: '',
    agreed: false,
    error: '',
    maxLen: NICKNAME_MAX,
    localOnly: LOCAL_ONLY_COPY,
    privacyPending: false,
  },
  onLoad() {
    const app = getApp<IAppOption>();
    app.globalData.onPrivacyNeeded = () => this.setData({ privacyPending: true });
  },
  onUnload() {
    getApp<IAppOption>().globalData.onPrivacyNeeded = undefined;
  },
  resolvePrivacy(event: 'agree' | 'disagree') {
    const app = getApp<IAppOption>();
    const r = app.globalData.privacyResolve;
    app.globalData.privacyResolve = undefined;
    if (r) r(event === 'agree' ? { event, buttonId: 'privacy-agree' } : { event });
    this.setData({ privacyPending: false });
  },
  onPrivacyAgree() {
    this.resolvePrivacy('agree');
  },
  onPrivacyDisagree() {
    this.resolvePrivacy('disagree');
  },
  async onChooseAvatar(e: any) {
    const tmp = e && e.detail && e.detail.avatarUrl;
    if (!tmp) return;
    const saved = await persistAvatar(tmp, this.data.avatarPath);
    this.setData({ avatarPath: saved || DEFAULT_AVATAR });
  },
  onNickInput(e: any) {
    this.setData({ nickname: e.detail.value, error: '' });
  },
  /** type="nickname" 的安全检测结果在 blur 时回填 */
  onNickBlur(e: any) {
    this.setData({ nickname: e.detail.value });
  },
  onAgreeChange(e: any) {
    this.setData({ agreed: (e.detail.value || []).length > 0 });
  },
  onOpenPrivacy() {
    if (wx.openPrivacyContract) {
      wx.openPrivacyContract({ fail: () => wx.navigateTo({ url: '/pages/agreement/agreement' }) });
    } else {
      wx.navigateTo({ url: '/pages/agreement/agreement' });
    }
  },
  onOpenAgreement() {
    wx.navigateTo({ url: '/pages/agreement/agreement' });
  },
  finish(user: LocalUser) {
    saveUser(user);
    const url = afterLoginUrl(isOnboardingDone());
    if (url === '/pages/today/today') wx.switchTab({ url });
    else wx.reLaunch({ url });
  },
  onSubmit() {
    if (!this.data.agreed) {
      this.setData({ error: '请先阅读并勾选隐私保护指引与用户协议' });
      return;
    }
    const v = validateNickname(this.data.nickname);
    if (!v.ok) {
      this.setData({ error: v.error });
      return;
    }
    this.finish(buildUser({ nickname: v.value, avatarPath: this.data.avatarPath }));
  },
  /** 暂不登录，先试用：默认昵称，仍记录 user（guest），不阻塞主路径 */
  onGuest() {
    this.finish(buildUser({ guest: true }));
  },
});

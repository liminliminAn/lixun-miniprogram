import { guardEntry } from '../../services/user';
import { CROWDS } from '../../constants/crowds';
import { getProfile, getPrefs, setPrefs, changeDaysPerWeek, hasCustomSchedule } from '../../services/profile';
import { profileLabels } from '../../utils/labels';
import { DAYS_PER_WEEK_OPTIONS } from '../../constants/templates';
import { getUser, saveUser, persistAvatar, clearAllLocalData } from '../../services/user';
import { validateNickname, DEFAULT_AVATAR, LOCAL_ONLY_COPY } from '../../utils/login';

Page({
  data: {
    profile: null as UserProfile | null,
    crowdName: '',
    labels: {} as Record<string, string>,
    restSoftWarnDays: 3,
    showWarmup: true,
    user: null as LocalUser | null,
    nickDraft: '',
    localOnly: LOCAL_ONLY_COPY,
    defaultAvatar: DEFAULT_AVATAR,
  },
  onShow() {
    if (!guardEntry()) return;
    const profile = getProfile();
    const prefs = getPrefs();
    const user = getUser();
    this.setData({
      user,
      nickDraft: user ? user.nickname : '',
      profile,
      labels: profileLabels(profile),
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
  onTapDays() {
    const cur = this.data.profile;
    if (!cur) return;
    wx.showActionSheet({
      itemList: DAYS_PER_WEEK_OPTIONS.map((n) => `每周 ${n} 练`),
      success: (res) => {
        const n = DAYS_PER_WEEK_OPTIONS[res.tapIndex];
        if (!n || n === cur.daysPerWeek) return;
        const apply = (overwrite: boolean) => {
          if (!changeDaysPerWeek(n, overwrite)) return;
          const np = getProfile();
          this.setData({ profile: np, labels: profileLabels(np) });
          wx.showToast({ title: overwrite ? '已重新生成课表' : '已保存，保留自定义课表', icon: 'none' });
        };
        if (!hasCustomSchedule()) {
          apply(true);
          return;
        }
        wx.showModal({
          title: '覆盖自定义课表？',
          content: `改为每周 ${n} 练会重新生成默认课表。确定则清除你自定义的课表；取消则保留自定义课表（仍按它安排训练）。`,
          confirmText: '覆盖',
          cancelText: '保留',
          success: (r) => apply(!!r.confirm),
        });
      },
    });
  },
  onPosture() {
    wx.navigateTo({ url: '/pages/posture/posture' });
  },
  async onChooseAvatar(e: any) {
    const u = getUser();
    const tmp = e && e.detail && e.detail.avatarUrl;
    if (!u || !tmp) return;
    const saved = await persistAvatar(tmp, u.avatarPath);
    if (!saved) return;
    const next = { ...u, avatarPath: saved };
    saveUser(next);
    this.setData({ user: next });
  },
  onNickInput(e: any) {
    this.setData({ nickDraft: e.detail.value });
  },
  onNickSave(e: any) {
    const u = getUser();
    if (!u) return;
    const v = validateNickname(e && e.detail && e.detail.value !== undefined ? e.detail.value : this.data.nickDraft);
    if (!v.ok) {
      wx.showToast({ title: v.error, icon: 'none' });
      this.setData({ nickDraft: u.nickname });
      return;
    }
    if (v.value === u.nickname) return;
    const next = { ...u, nickname: v.value, guest: false };
    saveUser(next);
    this.setData({ user: next, nickDraft: v.value });
    wx.showToast({ title: '已保存', icon: 'success' });
  },
  onReset() {
    wx.showModal({
      title: '退出并清除本地数据？',
      content: '将删除头像昵称、档案、课表、训练、体重与饮食记录，且无法恢复。',
      success: (res) => {
        if (!res.confirm) return;
        wx.showModal({
          title: '再次确认',
          content: '确定清除全部本地数据并退出吗？',
          success: (r2) => {
            if (!r2.confirm) return;
            clearAllLocalData();
            wx.reLaunch({ url: '/pages/login/login' });
          },
        });
      },
    });
  },
});

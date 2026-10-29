import { BF_BAND_LABELS, CROWDS } from '../../constants/crowds';
import { saveOnboarding, hasCustomSchedule, clearCustomSchedule } from '../../services/profile';

Page({
  data: {
    sex: 'male' as Sex,
    heightCm: '175',
    weightKg: '70',
    bfBand: 'mid' as BfBand,
    bfOptions: BF_BAND_LABELS.male,
    goal: 'recomp' as Goal,
    trainYears: 'half_to_2' as TrainYears,
    daysPerWeek: 4 as 4 | 5,
    jointLimit: false,
  },
  onSex(e: any) {
    const sex = e.currentTarget.dataset.v as Sex;
    this.setData({ sex, bfOptions: BF_BAND_LABELS[sex] });
  },
  onHeight(e: any) {
    this.setData({ heightCm: e.detail.value });
  },
  onWeight(e: any) {
    this.setData({ weightKg: e.detail.value });
  },
  onBf(e: any) {
    this.setData({ bfBand: e.currentTarget.dataset.v });
  },
  onGoal(e: any) {
    this.setData({ goal: e.currentTarget.dataset.v });
  },
  onYears(e: any) {
    this.setData({ trainYears: e.currentTarget.dataset.v });
  },
  onDays(e: any) {
    this.setData({ daysPerWeek: Number(e.currentTarget.dataset.v) as 4 | 5 });
  },
  onJoint(e: any) {
    this.setData({ jointLimit: !!e.detail.value });
  },
  onSubmit() {
    const heightCm = parseFloat(this.data.heightCm);
    const weightKg = parseFloat(this.data.weightKg);
    if (!heightCm || !weightKg) {
      wx.showToast({ title: '请填写身高体重', icon: 'none' });
      return;
    }
    const input: ClassifyInput = {
      heightCm,
      weightKg,
      sex: this.data.sex,
      bfBand: this.data.bfBand,
      goal: this.data.goal,
      trainYears: this.data.trainYears,
      daysPerWeek: this.data.daysPerWeek,
      jointLimit: this.data.jointLimit,
    };
    const profile = saveOnboarding(input);
    // §3.4-3：已有自定义课表 → 询问是否按新结果重新排课
    if (hasCustomSchedule()) {
      wx.showModal({
        title: '用新结果重新排课？',
        content: '你有自定义的周课表。重新排课会清除它，按新问卷结果生成默认课表。',
        confirmText: '重新排课',
        cancelText: '保留我的课表',
        success: (r) => {
          if (r.confirm) clearCustomSchedule();
          this.afterSave(input, profile);
        },
      });
      return;
    }
    this.afterSave(input, profile);
  },
  afterSave(input: ClassifyInput, profile: UserProfile) {
    const goToday = () => wx.switchTab({ url: '/pages/today/today' });
    // BUG-01：goal=cut 且 bfBand=very_low 时档位仍为 cut，但需软提示
    if (input.goal === 'cut' && input.bfBand === 'very_low') {
      wx.showModal({
        title: '减脂提醒',
        content:
          '当前体脂已很低，仍按减脂目标执行。请注意缺口不要过大，优先保住训练强度与恢复。',
        showCancel: false,
        confirmText: '知道了',
        success: () => goToday(),
      });
      return;
    }
    wx.showToast({
      title: `人群：${CROWDS[profile.crowd].name}`,
      icon: 'success',
    });
    setTimeout(goToday, 400);
  },
});

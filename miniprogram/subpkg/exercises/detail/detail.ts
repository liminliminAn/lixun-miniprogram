import { buildExerciseCard, ExerciseCardView } from '../../../utils/exerciseCards';

// 分包可引用主包配置
const CARDS: any = require('../../../config/exercise-cards.js');

Page({
  data: {
    card: null as ExerciseCardView | null,
    showImg: false,
    empty: false,
  },
  onLoad(q: any) {
    const card = buildExerciseCard(CARDS, decodeURIComponent((q && q.id) || ''));
    if (!card) {
      // 参数为空/无效 → 一行提示 + 返回按钮
      (this as any).setData({ empty: true });
      return;
    }
    (this as any).setData({ card, showImg: card.hasImage });
    wx.setNavigationBarTitle({ title: card.name || '动作图解' });
  },
  onBack() {
    wx.navigateBack({ fail: () => wx.switchTab({ url: '/pages/today/today' }) });
  },
  /** 图片加载失败 → 整块隐藏（不用占位图） */
  onImgError() {
    (this as any).setData({ showImg: false });
  },
});

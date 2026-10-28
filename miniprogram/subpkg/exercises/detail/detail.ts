import { buildExerciseCard, ExerciseCardView } from '../../../utils/exerciseCards';

// 分包可引用主包配置
const CARDS: any = require('../../../config/exercise-cards.js');

Page({
  data: {
    card: null as ExerciseCardView | null,
    showImg: false,
  },
  onLoad(q: any) {
    const card = buildExerciseCard(CARDS, decodeURIComponent((q && q.id) || ''));
    if (!card) {
      wx.navigateBack();
      return;
    }
    (this as any).setData({ card, showImg: card.hasImage });
    wx.setNavigationBarTitle({ title: card.name || '动作图解' });
  },
  /** 图片加载失败 → 整块隐藏（不用占位图） */
  onImgError() {
    (this as any).setData({ showImg: false });
  },
});

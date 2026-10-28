import { buildExerciseCard, PLACEHOLDER_IMAGE, ExerciseCardView } from '../../../utils/exerciseCards';

// 分包可引用主包配置
const CARDS: any = require('../../../config/exercise-cards.js');

Page({
  data: {
    card: null as ExerciseCardView | null,
    img: PLACEHOLDER_IMAGE,
  },
  onLoad(q: any) {
    const card = buildExerciseCard(CARDS, decodeURIComponent((q && q.id) || ''));
    if (!card) {
      wx.navigateBack();
      return;
    }
    (this as any).setData({ card, img: card.detailImage });
    wx.setNavigationBarTitle({ title: card.name || '动作图解' });
  },
  /** 配图尚未入库/加载失败 → 回退占位图 */
  onImgError() {
    if ((this as any).data.img !== PLACEHOLDER_IMAGE) (this as any).setData({ img: PLACEHOLDER_IMAGE });
  },
});

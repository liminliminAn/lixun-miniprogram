import { IMG_FAIL_HINT, onFigureError } from '../../../utils/warmup';
import { buildExerciseCard, ExerciseCardView } from '../../../utils/exerciseCards';

// 分包可引用主包配置
const CARDS: any = require('../../../config/exercise-cards.js');

Page({
  data: {
    card: null as ExerciseCardView | null,
    showImg: false,
    imgFailed: false,
    imgFailHint: IMG_FAIL_HINT,
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
  /** 有上一页才返回，否则回「今日」Tab */
  onBack() {
    if (getCurrentPages().length > 1) wx.navigateBack();
    else wx.switchTab({ url: '/pages/today/today' });
  },
  /** 图片加载失败 → warn + 文字兜底（不用占位图） */
  /** 图片加载失败 → console.warn 路径 + 文字兜底 */
  onImgError(e: any) {
    const self = this as any;
    self.setData(onFigureError(self.data.card.detailImage || '', e));
  },
});

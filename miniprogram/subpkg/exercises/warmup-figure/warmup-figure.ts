import { subpkgFigure } from '../../../utils/warmup';

/** 图解页：只认 /subpkg/ 下的文件名路径；加载失败 → 整块隐藏 */
Page({
  data: { img: '', title: '', cue: '', showImg: false, empty: false },
  onLoad(q: any) {
    const dec = (v: any) => (v ? decodeURIComponent(String(v)) : '');
    const img = subpkgFigure(dec(q && q.img));
    const title = dec(q && q.title);
    const cue = dec(q && q.cue);
    // 图/标题/要点全空 → 一行提示 + 返回；非法路径只隐藏图片
    (this as any).setData({ img, title, cue, showImg: !!img, empty: !img && !title && !cue });
    if (title) wx.setNavigationBarTitle({ title });
  },
  /** 有上一页才返回，否则回「今日」Tab */
  onBack() {
    if (getCurrentPages().length > 1) wx.navigateBack();
    else wx.switchTab({ url: '/pages/today/today' });
  },
  onImgError() {
    (this as any).setData({ showImg: false });
  },
});

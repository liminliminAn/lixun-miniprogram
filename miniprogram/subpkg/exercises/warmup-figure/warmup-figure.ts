import { subpkgFigure } from '../../../utils/warmup';

/** 图解页：只认 /subpkg/ 下的文件名路径；加载失败 → 整块隐藏 */
Page({
  data: { img: '', title: '', cue: '', showImg: false },
  onLoad(q: any) {
    const dec = (v: any) => (v ? decodeURIComponent(String(v)) : '');
    const img = subpkgFigure(dec(q && q.img));
    const title = dec(q && q.title);
    (this as any).setData({ img, title, cue: dec(q && q.cue), showImg: !!img });
    if (title) wx.setNavigationBarTitle({ title });
  },
  onImgError() {
    (this as any).setData({ showImg: false });
  },
});

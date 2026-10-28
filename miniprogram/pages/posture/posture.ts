import { DOSE_LABEL, figureUrl, POSTURE_FIGURE_PAGE } from '../../utils/warmup';
import { buildPostureView, COPY_TOAST } from '../../utils/posture';

const CONFIG: any = require('../../config/posture.js');

Page({
  data: {
    view: buildPostureView(CONFIG),
    medicalOpen: true,
    doseLabel: DOSE_LABEL,
  },
  onToggleMedical() {
    this.setData({ medicalOpen: !this.data.medicalOpen });
  },
  /** 分包图解页（主包不渲染分包图片） */
  onOpenFigure(e: any) {
    const d = e.currentTarget.dataset;
    if (d.img) wx.navigateTo({ url: figureUrl(POSTURE_FIGURE_PAGE, d.img, d.title, d.cue) });
  },
  onCopyLink(e: any) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.url,
      success: () => wx.showToast({ title: COPY_TOAST, icon: 'none' }),
    });
  },
});

import { DOSE_LABEL } from '../../utils/warmup';
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
  onCopyLink(e: any) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.url,
      success: () => wx.showToast({ title: COPY_TOAST, icon: 'none' }),
    });
  },
});

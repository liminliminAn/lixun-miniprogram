import { buildPostureView } from '../../utils/posture';

const CONFIG: any = require('../../config/posture.js');

Page({
  data: {
    view: buildPostureView(CONFIG),
  },
  onCopyLink(e: any) {
    wx.setClipboardData({ data: e.currentTarget.dataset.url });
  },
});

import { chartGeometry, themeColors } from '../../utils/themeColors';

const W = 320;
const H = 180;

Component({
  properties: {
    /** {date,kg,ma?}；ma 仅在 ≥4/7 天阈值下由页面填入 */
    list: { type: Array, value: [] },
  },
  data: {
    empty: true,
    hasMa: false,
  },
  lifetimes: {
    attached() {
      const self = this as any;
      self._theme = (wx.getSystemInfoSync() as any).theme || 'dark';
      self._onTheme = (res: { theme: string }) => {
        self._theme = res.theme;
        self.draw();
      };
      if ((wx as any).onThemeChange) (wx as any).onThemeChange(self._onTheme);
    },
    detached() {
      const self = this as any;
      if ((wx as any).offThemeChange) (wx as any).offThemeChange(self._onTheme);
    },
  },
  observers: {
    list(list: any[]) {
      const empty = !list || !list.length;
      (this as any).setData({ empty, hasMa: !empty && list.some((e) => typeof e.ma === 'number') }, () =>
        (this as any).draw(),
      );
    },
  },
  methods: {
    draw() {
      const self = this as any;
      if (self.data.empty) return;
      self
        .createSelectorQuery()
        .select('#wchart')
        .fields({ node: true, size: true })
        .exec((res: any[]) => {
          const node = res && res[0] && res[0].node;
          if (!node) return;
          const dpr = wx.getSystemInfoSync().pixelRatio || 2;
          const w = res[0].width || W;
          const h = res[0].height || H;
          node.width = w * dpr;
          node.height = h * dpr;
          const ctx = node.getContext('2d');
          ctx.scale(dpr, dpr);
          const c = themeColors(self._theme);
          const g = chartGeometry(self.data.list, w, h);
          ctx.clearRect(0, 0, w, h);
          // 上下边界参考线
          ctx.strokeStyle = c.border;
          ctx.lineWidth = 1;
          [24, h - 24].forEach((y) => {
            ctx.beginPath();
            ctx.moveTo(24, y);
            ctx.lineTo(w - 24, y);
            ctx.stroke();
          });
          ctx.fillStyle = c.inkSecondary;
          ctx.font = '10px sans-serif';
          ctx.fillText(g.max.toFixed(1), 0, 20);
          ctx.fillText(g.min.toFixed(1), 0, h - 8);
          // 7 日均线
          if (g.ma.length >= 2) {
            ctx.strokeStyle = c.accent;
            ctx.lineWidth = 2;
            ctx.beginPath();
            g.ma.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
            ctx.stroke();
          }
          // 原始点
          ctx.fillStyle = g.ma.length >= 2 ? c.inkSecondary : c.accent;
          g.raw.forEach((p) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();
          });
        });
    },
  },
});

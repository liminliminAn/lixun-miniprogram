Component({
  properties: {
    days: { type: Number, value: 0 },
    threshold: { type: Number, value: 3 },
  },
  data: {
    visible: false,
  },
  observers: {
    'days, threshold': function (days: number, threshold: number) {
      this.setData({ visible: days > threshold });
    },
  },
});

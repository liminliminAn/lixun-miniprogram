Component({
  properties: {
    list: { type: Array, value: [] },
  },
  data: {
    entries: [] as Array<BodyWeightEntry & { pct: number }>,
  },
  observers: {
    list(list: BodyWeightEntry[]) {
      if (!list || !list.length) {
        this.setData({ entries: [] });
        return;
      }
      const max = Math.max(...list.map((e) => e.kg), 1);
      const min = Math.min(...list.map((e) => e.kg));
      const span = Math.max(max - min, 1);
      const entries = list.slice(0, 14).map((e) => ({
        ...e,
        pct: Math.round(30 + ((e.kg - min) / span) * 70),
      }));
      this.setData({ entries });
    },
  },
});

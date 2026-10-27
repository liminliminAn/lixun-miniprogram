Component({
  properties: {
    name: { type: String, value: '' },
    tips: { type: Array, value: [] },
    contraindications: { type: String, value: '' },
  },
  data: {
    expanded: false,
  },
  methods: {
    toggle() {
      this.setData({ expanded: !this.data.expanded });
    },
  },
});

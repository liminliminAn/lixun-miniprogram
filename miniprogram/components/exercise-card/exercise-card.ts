import { buildExerciseCard, ExerciseCardView } from '../../utils/exerciseCards';

const CARDS: any = require('../../config/exercise-cards.js');

Component({
  properties: {
    name: { type: String, value: '' },
    exerciseId: { type: String, value: '' },
  },
  data: {
    expanded: false,
    card: null as ExerciseCardView | null,
  },
  observers: {
    exerciseId(id: string) {
      (this as any).setData({ card: buildExerciseCard(CARDS, id) });
    },
  },
  methods: {
    onOpenDetail() {
      const c = (this as any).data.card;
      if (c) wx.navigateTo({ url: c.detailUrl });
    },
    toggle() {
      this.setData({ expanded: !this.data.expanded });
    },
  },
});

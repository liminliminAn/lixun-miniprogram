Component({
  properties: {
    title: { type: String, value: '' },
    sets: { type: Array, value: [] },
    exerciseId: { type: String, value: '' },
    currentIndex: { type: Number, value: 0 },
  },
  data: {
    viewSets: [] as any[],
  },
  observers: {
    'sets, currentIndex': function (sets: SetRecord[], currentIndex: number) {
      const viewSets = (sets || []).map((s, i) => ({
        reps: s.reps,
        weight: s.weight,
        done: !!s.done,
        isCurrent: i === currentIndex,
        weightDisplay:
          s.weight === 0 && !s.done ? '' : String(s.weight ?? ''),
        repsDisplay: s.reps === 0 && !s.done ? '' : String(s.reps ?? ''),
      }));
      this.setData({ viewSets });
    },
  },
  methods: {
    emit(sets: SetRecord[], extra?: { currentIndex?: number }) {
      this.triggerEvent('change', {
        exerciseId: this.properties.exerciseId,
        sets,
        ...extra,
      });
    },
    cloneSets(): SetRecord[] {
      return (this.data.sets as SetRecord[]).map((s) => ({ ...s }));
    },
    onField(e: any) {
      const index = Number(e.currentTarget.dataset.index);
      const field = e.currentTarget.dataset.field as 'reps' | 'weight';
      const raw = e.detail.value;
      const sets = this.cloneSets().map((s, i) => {
        if (i !== index) return s;
        if (field === 'reps') {
          return { ...s, reps: parseInt(raw || '0', 10) || 0 };
        }
        return { ...s, weight: parseFloat(raw || '0') || 0 };
      });
      this.emit(sets);
    },
    onAddSet() {
      const sets = this.cloneSets();
      const last = sets[sets.length - 1] || { reps: 8, weight: 0, done: false };
      sets.push({ reps: last.reps, weight: last.weight, done: false });
      this.emit(sets, { currentIndex: sets.length - 1 });
    },
    onSelect(e: any) {
      const index = Number(e.currentTarget.dataset.index);
      this.triggerEvent('select', {
        exerciseId: this.properties.exerciseId,
        index,
      });
    },
    onToggleDone(e: any) {
      const index = Number(e.currentTarget.dataset.index);
      const sets = this.cloneSets().map((s, i) =>
        i === index ? { ...s, done: !s.done } : s,
      );
      let next = index;
      if (sets[index].done) {
        const upcoming = sets.findIndex((s, i) => i > index && !s.done);
        next = upcoming >= 0 ? upcoming : index;
      }
      this.emit(sets, { currentIndex: next });
    },
  },
});

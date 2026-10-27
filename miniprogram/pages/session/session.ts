import { EXERCISE_MAP } from '../../constants/exercises';
import { DAY_TYPE_LABEL } from '../../constants/templates';
import {
  startOrResumeSession,
  saveSession,
  completeSession,
} from '../../services/workout';
import { formatDate } from '../../utils/date';

Page({
  data: {
    date: '',
    dayLabel: '',
    rows: [] as any[],
    exerciseIndex: 0,
    currentSetIndex: 0,
    current: null as any,
    displayWeight: '—',
    displayReps: '—',
    showTips: false,
    nextLabel: '下一动作',
  },
  session: null as SessionRecord | null,
  onLoad() {
    const date = formatDate();
    const session = startOrResumeSession(date);
    if (!session) {
      wx.showToast({ title: '今日休息，无需开练', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 500);
      return;
    }
    this.session = session;
    this.syncRows(session, 0, 0);
  },
  syncRows(
    session: SessionRecord,
    exerciseIndex: number,
    currentSetIndex: number,
  ) {
    const rows = session.exercises.map((ex) => {
      const def = EXERCISE_MAP[ex.exerciseId];
      const sets = ex.sets.map((s) => ({
        reps: s.reps,
        weight: s.weight,
        done: !!s.done,
      }));
      return {
        exerciseId: ex.exerciseId,
        name: def?.name || ex.exerciseId,
        tips: def?.tips || [],
        contraindications: def?.contraindications || '',
        sets,
        allDone: sets.length > 0 && sets.every((s) => s.done),
      };
    });
    const safeEx = Math.min(Math.max(exerciseIndex, 0), Math.max(rows.length - 1, 0));
    const current = rows[safeEx] || null;
    let setIdx = currentSetIndex;
    if (current) {
      setIdx = Math.min(Math.max(setIdx, 0), Math.max(current.sets.length - 1, 0));
      const unfinished = current.sets.findIndex((s: any) => !s.done);
      if (current.sets[setIdx]?.done && unfinished >= 0) {
        // keep explicit selection if user tapped; otherwise prefer first unfinished
      }
    }
    const curSet = current?.sets?.[setIdx];
    const isLastEx = safeEx >= rows.length - 1;
    this.setData({
      date: session.date,
      dayLabel: DAY_TYPE_LABEL[session.dayType],
      rows,
      exerciseIndex: safeEx,
      currentSetIndex: setIdx,
      current,
      displayWeight:
        curSet && (curSet.weight > 0 || curSet.done)
          ? String(curSet.weight)
          : curSet
            ? String(curSet.weight || '—')
            : '—',
      displayReps:
        curSet && (curSet.reps > 0 || curSet.done)
          ? String(curSet.reps)
          : curSet
            ? String(curSet.reps || '—')
            : '—',
      nextLabel: isLastEx ? '完成训练' : '下一动作',
    });
  },
  onSetsChange(e: any) {
    const { exerciseId, sets, currentIndex } = e.detail;
    if (!this.session) return;
    this.session.exercises = this.session.exercises.map((ex) =>
      ex.exerciseId === exerciseId ? { ...ex, sets } : ex,
    );
    saveSession(this.session);
    const nextSet =
      typeof currentIndex === 'number' ? currentIndex : this.data.currentSetIndex;
    this.syncRows(this.session, this.data.exerciseIndex, nextSet);
  },
  onSelectSet(e: any) {
    const { index } = e.detail;
    if (!this.session) return;
    this.syncRows(this.session, this.data.exerciseIndex, index);
  },
  onToggleTips() {
    this.setData({ showTips: !this.data.showTips });
  },
  onCompleteSet() {
    if (!this.session) return;
    const exIdx = this.data.exerciseIndex;
    const setIdx = this.data.currentSetIndex;
    const ex = this.session.exercises[exIdx];
    if (!ex || !ex.sets[setIdx]) return;
    ex.sets = ex.sets.map((s, i) =>
      i === setIdx ? { ...s, done: true } : s,
    );
    saveSession(this.session);
    const nextUnfinished = ex.sets.findIndex((s, i) => i > setIdx && !s.done);
    const nextSet = nextUnfinished >= 0 ? nextUnfinished : setIdx;
    this.syncRows(this.session, exIdx, nextSet);
    if (nextUnfinished < 0 && ex.sets.every((s) => s.done)) {
      wx.showToast({ title: '本动作完成', icon: 'success' });
    }
  },
  onNextExercise() {
    if (!this.session) return;
    const next = this.data.exerciseIndex + 1;
    if (next >= this.session.exercises.length) {
      this.onComplete();
      return;
    }
    this.setData({ showTips: false });
    this.syncRows(this.session, next, 0);
  },
  onComplete() {
    if (!this.session) return;
    completeSession(this.session.date);
    wx.showToast({ title: '已保存', icon: 'success' });
    setTimeout(() => {
      wx.switchTab({ url: '/pages/today/today' });
    }, 400);
  },
});

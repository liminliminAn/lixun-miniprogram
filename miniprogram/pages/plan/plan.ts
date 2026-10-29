import { guardEntry } from '../../services/user';
import { DAY_TYPE_LABEL, WEEKDAY_LABELS } from '../../constants/templates';
import { exercisesByDay, EXERCISE_MAP } from '../../constants/exercises';
import { getPlan, getEffectiveWeek, saveCustomSchedule, clearCustomSchedule, hasCustomSchedule } from '../../services/profile';
import { getSessions } from '../../services/workout';
import { formatDate } from '../../utils/date';
import {
  DAY_KINDS, DAY_KIND_SHEET, TODAY_LOCKED_TIP, streakSoftTip, setDay, buildWeekCells, clampWeekOffset, tapAction, sessionSummary, shortDate, weekDates,
} from '../../utils/schedule';

Page({
  data: {
    daysPerWeek: 4,
    customized: false,
    weekOffset: 0,
    weekRange: '',
    streakTip: '',
    weekCells: [] as any[],
    dayBlocks: [] as any[],
  },
  onShow() {
    if (!guardEntry()) return;
    this.setData({ weekOffset: 0 });
    this.refresh();
  },
  refresh() {
    const plan = getPlan();
    if (!plan) return;
    const today = formatDate();
    const offset = clampWeekOffset(this.data.weekOffset);
    const weekCells = buildWeekCells(getEffectiveWeek(), today, offset, getSessions() as any).map((c) => ({
      ...c,
      wd: WEEKDAY_LABELS[c.idx],
      label: DAY_TYPE_LABEL[c.dayType],
    }));
    const dates = weekDates(today, offset);
    const types: Array<Exclude<DayType, 'rest'>> = ['push', 'pull', 'legs'];
    const dayBlocks = types.map((t) => ({
      dayType: t,
      label: DAY_TYPE_LABEL[t],
      exercises: exercisesByDay(t),
    }));
    this.setData({
      daysPerWeek: plan.daysPerWeek,
      customized: hasCustomSchedule(),
      streakTip: streakSoftTip(getEffectiveWeek()),
      weekOffset: offset,
      weekRange: `${shortDate(dates[0])} – ${shortDate(dates[6])}`,
      weekCells,
      dayBlocks,
    });
  },
  onPrevWeek() {
    this.setData({ weekOffset: this.data.weekOffset - 1 });
    this.refresh();
  },
  onNextWeek() {
    if (this.data.weekOffset >= 0) return;
    this.setData({ weekOffset: clampWeekOffset(this.data.weekOffset + 1) });
    this.refresh();
  },
  onTapDay(e: any) {
    const idx = Number(e.currentTarget.dataset.idx);
    const cell = this.data.weekCells[idx];
    if (!cell) return;
    const action = tapAction(cell);
    if (action === 'locked') {
      wx.showToast({ title: TODAY_LOCKED_TIP, streakSoftTip, icon: 'none' });
      return;
    }
    if (action === 'none') {
      wx.showToast({ title: '这天没有训练记录', icon: 'none' });
      return;
    }
    if (action === 'record') {
      const s = (getSessions() as any)[cell.date];
      wx.showModal({
        title: `${cell.md} ${DAY_TYPE_LABEL[cell.dayType as DayType]}日记录`,
        content: sessionSummary(s, (id) => (EXERCISE_MAP[id] ? EXERCISE_MAP[id].name : id)),
        showCancel: false,
        confirmText: '知道了',
      });
      return;
    }
    wx.showActionSheet({
      itemList: DAY_KIND_SHEET,
      success: (res) => {
        const kind = DAY_KINDS[res.tapIndex];
        if (!kind) return;
        const next = setDay(getEffectiveWeek(), idx, kind);
        saveCustomSchedule(next); // 软提示，不拦截保存
        this.refresh();
        const tip = streakSoftTip(next.week);
        if (tip) wx.showToast({ title: tip, icon: 'none' });
      },
    });
  },
  onRestoreDefault() {
    clearCustomSchedule();
    this.refresh();
    wx.showToast({ title: '已恢复默认', icon: 'none' });
  },
});

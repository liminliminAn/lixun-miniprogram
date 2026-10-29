import { guardEntry } from '../../services/user';
import { DAY_TYPE_LABEL, WEEKDAY_LABELS } from '../../constants/templates';
import { exercisesByDay, EXERCISE_MAP } from '../../constants/exercises';
import { getPlan, getProfile, getEffectiveWeek, saveCustomSchedule, clearCustomSchedule, hasCustomSchedule } from '../../services/profile';
import { getSessions } from '../../services/workout';
import { formatDate, mondayBasedIndex } from '../../utils/date';
import {
  DAY_KINDS, DAY_KIND_SHEET, TODAY_LOCKED_TIP, streakSoftTip, PAST_NO_RECORD_LABEL, setDay, buildWeekCells, clampWeekOffset, tapAction, sessionSummary, shortDate, weekDates, weekWithTodayPinned,
} from '../../utils/schedule';
import { buildMonthCells, firstUseDate, monthOffsetRange, clampMonthOffset, shiftMonth, monthTitle, editSheetTitle, MONTH_WEEKDAY_HEADER } from '../../utils/monthGrid';

/** 生效课表 + 今天按已开练记录固定（§3.4-8/9） */
function pinnedWeek(): DayType[] {
  return weekWithTodayPinned(getEffectiveWeek(), mondayBasedIndex(new Date()), (getSessions() as any)[formatDate()]);
}

Page({
  data: {
    daysPerWeek: 4,
    customized: false,
    weekOffset: 0,
    weekRange: '',
    streakTip: '',
    weekCells: [] as any[],
    dayBlocks: [] as any[],
    expanded: false,
    monthOffset: 0,
    monthTitle: '',
    monthHeader: MONTH_WEEKDAY_HEADER,
    monthCells: [] as any[],
    monthMin: 0,
    monthMax: 1,
  },
  onShow() {
    if (!guardEntry()) return;
    this.setData({ weekOffset: 0, monthOffset: 0 });
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
      label: c.noRecord ? PAST_NO_RECORD_LABEL : DAY_TYPE_LABEL[c.dayType],
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
      streakTip: streakSoftTip(pinnedWeek()),
      weekOffset: offset,
      weekRange: `${shortDate(dates[0])} – ${shortDate(dates[6])}`,
      weekCells,
      dayBlocks,
    });
    if (this.data.expanded) this.refreshMonth();
  },
  refreshMonth() {
    const today = formatDate();
    const sessions = getSessions() as any;
    const profile = getProfile();
    const firstUse = firstUseDate(profile ? profile.createdAt : null, Object.keys(sessions), today);
    const range = monthOffsetRange(today, firstUse);
    const monthOffset = clampMonthOffset(this.data.monthOffset, range);
    const { year, month } = shiftMonth(today, monthOffset);
    this.setData({
      monthOffset,
      monthMin: range.min,
      monthMax: range.max,
      monthTitle: monthTitle(year, month),
      monthCells: buildMonthCells(year, month, today, getEffectiveWeek(), sessions, firstUse),
    });
  },
  onToggleMonth() {
    this.setData({ expanded: !this.data.expanded, monthOffset: 0 });
    if (this.data.expanded) this.refreshMonth();
  },
  onPrevMonth() {
    if (this.data.monthOffset <= this.data.monthMin) return;
    this.setData({ monthOffset: this.data.monthOffset - 1 });
    this.refreshMonth();
  },
  onNextMonth() {
    if (this.data.monthOffset >= this.data.monthMax) return;
    this.setData({ monthOffset: this.data.monthOffset + 1 });
    this.refreshMonth();
  },
  onTapMonthDay(e: any) {
    const cell = this.data.monthCells[Number(e.currentTarget.dataset.i)];
    if (!cell || !cell.tappable) return; // §3.5-3/4
    this.handleTap({ ...cell, idx: cell.weekdayIdx, md: shortDate(cell.date) }, editSheetTitle(cell.weekdayIdx));
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
    this.handleTap(cell, editSheetTitle(idx));
  },
  handleTap(cell: any, sheetTitle: string) {
    const idx = cell.idx;
    const action = tapAction(cell);
    if (action === 'locked') {
      wx.showToast({ title: TODAY_LOCKED_TIP, icon: 'none' });
      return;
    }
    if (action === 'none') {
      wx.showToast({ title: '这天没有训练记录', icon: 'none' });
      return;
    }
    if (action === 'record') {
      const s = (getSessions() as any)[cell.date];
      wx.showModal({
        title: `${cell.md} ${cell.dayType ? DAY_TYPE_LABEL[cell.dayType as DayType] : ''}日记录`,
        content: sessionSummary(s, (id) => (EXERCISE_MAP[id] ? EXERCISE_MAP[id].name : id)),
        showCancel: false,
        confirmText: '知道了',
      });
      return;
    }
    wx.showActionSheet({
      alertText: sheetTitle,
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

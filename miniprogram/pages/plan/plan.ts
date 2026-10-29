import { guardEntry } from '../../services/user';
import { DAY_TYPE_LABEL, WEEKDAY_LABELS } from '../../constants/templates';
import { exercisesByDay, EXERCISE_MAP } from '../../constants/exercises';
import { getPlan, getProfile, getEffectiveWeek, clearCustomSchedule, hasCustomSchedule, getDateOverrides, setDateOverride, clearDateOverrides, hasActiveOverrides } from '../../services/profile';
import { getSessions } from '../../services/workout';
import { formatDate } from '../../utils/date';
import {
  DAY_KINDS, DAY_KIND_SHEET, TODAY_LOCKED_TIP, streakSoftTipDays, PAST_REST_LABEL, buildWeekCells, clampWeekOffset, tapAction, sessionSummary, shortDate, weekDates, pinnedResolvedDays, overrideSheetTitle,
} from '../../utils/schedule';
import { buildMonthCells, firstUseDate, monthOffsetRange, clampMonthOffset, shiftMonth, monthTitle, monthDayPopup, MONTH_WEEKDAY_HEADER } from '../../utils/monthGrid';

/** 本周一到下周日的具体生效类型（日期覆盖 → 周模板）+ 今天按已开练记录固定（§3.4-8/9）；连练按日期线性计算 */
function pinnedDays(): DayType[] {
  const today = formatDate();
  const sessions = getSessions() as any;
  return pinnedResolvedDays(getEffectiveWeek(), today, getDateOverrides(), sessions[today], sessions);
}

Page({
  data: {
    daysPerWeek: 4,
    customized: false,
    restorable: false,
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
    const weekCells = buildWeekCells(getEffectiveWeek(), today, offset, getSessions() as any, getDateOverrides()).map((c) => ({
      ...c,
      wd: WEEKDAY_LABELS[c.idx],
      // 过去无记录「休」；已练「✓推」（类型色）；未完成在下方标「未完成」
      label: c.noRecord ? PAST_REST_LABEL : c.tense === 'past' && c.trained ? `✓${DAY_TYPE_LABEL[c.dayType]}` : DAY_TYPE_LABEL[c.dayType],
    }));
    const dates = weekDates(today, offset);
    const types: Array<Exclude<DayType, 'rest'>> = ['push', 'pull', 'legs'];
    const dayBlocks = types.map((t) => ({
      dayType: t,
      label: DAY_TYPE_LABEL[t],
      exercises: exercisesByDay(t),
    }));
    // 「自定义」标签与「恢复默认」同一口径：有周模板，或今天及以后有覆盖
    const restorable = hasCustomSchedule() || hasActiveOverrides(today);
    this.setData({
      daysPerWeek: plan.daysPerWeek,
      customized: restorable,
      restorable,
      streakTip: streakSoftTipDays(pinnedDays()),
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
      monthCells: buildMonthCells(year, month, today, getEffectiveWeek(), sessions, firstUse, getDateOverrides()),
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
    // 选项 B：今天（未开练）及以后可改当天；过去日与已锁定的今天只看
    if (cell.editable) {
      this.editDate(cell.date);
      return;
    }
    if (cell.isToday) {
      wx.showToast({ title: TODAY_LOCKED_TIP, icon: 'none' });
      return;
    }
    const p = monthDayPopup(cell, (getSessions() as any)[cell.date], (id) => (EXERCISE_MAP[id] ? EXERCISE_MAP[id].name : id));
    wx.showModal({ title: p.title, content: p.content, showCancel: false, confirmText: '知道了' });
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
    this.editDate(cell.date);
  },
  /** 只改这一天：写日期覆盖（周视图、月历共用） */
  editDate(date: string) {
    wx.showActionSheet({
      alertText: overrideSheetTitle(date),
      itemList: DAY_KIND_SHEET,
      success: (res) => {
        const kind = DAY_KINDS[res.tapIndex];
        if (!kind) return;
        setDateOverride(date, kind); // 软提示，不拦截保存
        this.refresh();
        const tip = streakSoftTipDays(pinnedDays());
        if (tip) wx.showToast({ title: tip, icon: 'none' });
      },
    });
  },
  onRestoreDefault() {
    // 恢复默认：二次确认后才清除自定义周模板和所有日期覆盖；今天已开练仍按记录固定（§3.4-8）
    wx.showModal({
      title: '恢复默认课表？',
      content: '会清除你自定义的周课表和所有按日修改，按问卷结果恢复默认课表。',
      confirmText: '恢复默认',
      cancelText: '取消',
      success: (r) => {
        if (!r.confirm) return;
        clearCustomSchedule();
        clearDateOverrides();
        this.refresh();
        wx.showToast({ title: '已恢复默认', icon: 'none' });
      },
    });
  },
});

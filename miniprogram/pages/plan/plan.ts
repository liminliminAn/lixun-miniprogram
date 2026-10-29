import { guardEntry } from '../../services/user';
import { DAY_TYPE_LABEL, WEEKDAY_LABELS } from '../../constants/templates';
import { exercisesByDay } from '../../constants/exercises';
import { getPlan, getEffectiveWeek, saveCustomSchedule, clearCustomSchedule, hasCustomSchedule } from '../../services/profile';
import { DAY_KINDS, DAY_KIND_SHEET, setDay } from '../../utils/schedule';

Page({
  data: {
    daysPerWeek: 4,
    customized: false,
    weekCells: [] as any[],
    dayBlocks: [] as any[],
  },
  onShow() {
    if (!guardEntry()) return;
    this.refresh();
  },
  refresh() {
    const plan = getPlan();
    if (!plan) return;
    const weekCells = getEffectiveWeek().map((dayType, idx) => ({
      idx,
      wd: WEEKDAY_LABELS[idx],
      dayType,
      label: DAY_TYPE_LABEL[dayType],
    }));
    const types: Array<Exclude<DayType, 'rest'>> = ['push', 'pull', 'legs'];
    const dayBlocks = types.map((t) => ({
      dayType: t,
      label: DAY_TYPE_LABEL[t],
      exercises: exercisesByDay(t),
    }));
    this.setData({
      daysPerWeek: plan.daysPerWeek,
      customized: hasCustomSchedule(),
      weekCells,
      dayBlocks,
    });
  },
  onTapDay(e: any) {
    const idx = Number(e.currentTarget.dataset.idx);
    wx.showActionSheet({
      itemList: DAY_KIND_SHEET,
      success: (res) => {
        const kind = DAY_KINDS[res.tapIndex];
        if (!kind) return;
        saveCustomSchedule(setDay(getEffectiveWeek(), idx, kind));
        this.refresh();
      },
    });
  },
  onRestoreDefault() {
    clearCustomSchedule();
    this.refresh();
    wx.showToast({ title: '已恢复默认', icon: 'none' });
  },
});

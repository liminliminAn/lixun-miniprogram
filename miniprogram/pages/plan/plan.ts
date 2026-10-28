import { guardEntry } from '../../services/user';
import { DAY_TYPE_LABEL, WEEKDAY_LABELS } from '../../constants/templates';
import { exercisesByDay } from '../../constants/exercises';
import { getPlan } from '../../services/profile';

Page({
  data: {
    daysPerWeek: 4,
    weekCells: [] as any[],
    dayBlocks: [] as any[],
  },
  onShow() {
    if (!guardEntry()) return;
    const plan = getPlan();
    if (!plan) return;
    const weekCells = plan.week.map((dayType, idx) => ({
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
      weekCells,
      dayBlocks,
    });
  },
});

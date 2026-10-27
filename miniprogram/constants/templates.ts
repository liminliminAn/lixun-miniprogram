/**
 * 周历模板（周一 → 周日）
 * 4 练：推,拉,腿,休,拉,休,休（去掉第二次推；周内第二次训练日类型为拉）
 * 5 练：推,拉,腿,休,推,拉,休
 */
export const WEEK_TEMPLATES: Record<4 | 5, DayType[]> = {
  4: ['push', 'pull', 'legs', 'rest', 'pull', 'rest', 'rest'],
  5: ['push', 'pull', 'legs', 'rest', 'push', 'pull', 'rest'],
};

export const DAY_TYPE_LABEL: Record<DayType, string> = {
  push: '推',
  pull: '拉',
  legs: '腿',
  rest: '休',
};

export const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];

export function buildWeekPlan(daysPerWeek: 4 | 5): WeekPlan {
  return {
    daysPerWeek,
    week: [...WEEK_TEMPLATES[daysPerWeek]],
    updatedAt: new Date().toISOString(),
  };
}

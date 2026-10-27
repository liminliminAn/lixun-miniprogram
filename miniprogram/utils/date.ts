/** 本地日历日 YYYY-MM-DD */
export function formatDate(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** 周一=0 … 周日=6（与 WEEK_TEMPLATES 下标对齐） */
export function mondayBasedIndex(d: Date = new Date()): number {
  const js = d.getDay(); // 0 Sun … 6 Sat
  return js === 0 ? 6 : js - 1;
}

export function addDays(dateStr: string, delta: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  return formatDate(dt);
}

/** 从今天往前数连续有训练记录的天数（含今天若已练） */
export function countConsecutiveTrainDays(
  trainDateSet: Set<string>,
  today: string = formatDate(),
): number {
  let count = 0;
  let cursor = today;
  // 若今天还没练，从昨天开始算「连练」
  if (!trainDateSet.has(today)) {
    cursor = addDays(today, -1);
  }
  while (trainDateSet.has(cursor)) {
    count += 1;
    cursor = addDays(cursor, -1);
  }
  return count;
}

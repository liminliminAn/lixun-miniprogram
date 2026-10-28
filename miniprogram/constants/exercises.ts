export interface ExerciseDef {
  id: string;
  name: string;
  dayType: Exclude<DayType, 'rest'>;
  /** 要点/步骤/错误/剂量/注意 统一读 config/exercise-cards.js */
}

export const EXERCISES: ExerciseDef[] = [
  // 推
  {
    id: 'barbell_bench',
    name: '杠铃卧推',
    dayType: 'push',
  },
  {
    id: 'db_incline_press',
    name: '哑铃上斜卧推',
    dayType: 'push',
  },
  {
    id: 'dip',
    name: '双杠臂屈伸',
    dayType: 'push',
  },
  {
    id: 'skull_crusher',
    name: '仰卧臂屈伸',
    dayType: 'push',
  },
  {
    id: 'y_lateral_raise',
    name: 'Y字侧平举',
    dayType: 'push',
  },
  // 拉
  {
    id: 'single_cable_pulldown',
    name: '单手钢线下拉',
    dayType: 'pull',
  },
  {
    id: 'neutral_lat_pulldown',
    name: '对握高位下拉',
    dayType: 'pull',
  },
  {
    id: 'single_machine_row',
    name: '单手器械划船',
    dayType: 'pull',
  },
  {
    id: 'flared_row',
    name: '开肘划船',
    dayType: 'pull',
  },
  {
    id: 'cable_curl',
    name: '钢线弯举',
    dayType: 'pull',
  },
  // 腿
  {
    id: 'single_rdl',
    name: '单腿硬拉',
    dayType: 'legs',
  },
  {
    id: 'bulgarian_split_squat',
    name: '保加利亚蹲',
    dayType: 'legs',
  },
  {
    id: 'goblet_squat',
    name: '高脚杯深蹲',
    dayType: 'legs',
  },
  {
    id: 'rdl',
    name: 'RDL',
    dayType: 'legs',
  },
  {
    id: 'back_extension',
    name: '山羊挺身',
    dayType: 'legs',
  },
];

export const EXERCISE_MAP: Record<string, ExerciseDef> = EXERCISES.reduce(
  (acc, ex) => {
    acc[ex.id] = ex;
    return acc;
  },
  {} as Record<string, ExerciseDef>,
);

export function exercisesByDay(
  dayType: Exclude<DayType, 'rest'>,
): ExerciseDef[] {
  return EXERCISES.filter((e) => e.dayType === dayType);
}

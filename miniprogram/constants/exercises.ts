export interface ExerciseDef {
  id: string;
  name: string;
  dayType: Exclude<DayType, 'rest'>;
  tips: [string, string, string];
  /** 禁忌占位 */
  contraindications: string;
}

export const EXERCISES: ExerciseDef[] = [
  // 推
  {
    id: 'barbell_bench',
    name: '杠铃卧推',
    dayType: 'push',
    tips: ['肩胛后收下沉贴凳', '小臂接近垂直于杠', '底部肘约 45° 打开'],
    contraindications: '肩峰撞击、未愈合的胸肌/肩袖伤（占位）',
  },
  {
    id: 'db_incline_press',
    name: '哑铃上斜卧推',
    dayType: 'push',
    tips: ['凳面约 30–45°', '腕肘肩一线推起', '顶部勿过度内旋'],
    contraindications: '急性肩前侧疼痛（占位）',
  },
  {
    id: 'dip',
    name: '双杠臂屈伸',
    dayType: 'push',
    tips: ['躯干微前倾偏胸', '肘勿过度外展', '下至上臂约平行即可'],
    contraindications: '肩前不稳、肘关节急性炎（占位）',
  },
  {
    id: 'skull_crusher',
    name: '仰卧臂屈伸',
    dayType: 'push',
    tips: ['上臂相对固定', '肘为主导屈伸', '重量可控避免甩杠'],
    contraindications: '肘腱末端病急性期（占位）',
  },
  {
    id: 'y_lateral_raise',
    name: 'Y字侧平举',
    dayType: 'push',
    tips: ['轻重量注重外旋', '拇指约指向斜上方', '避免耸肩借力'],
    contraindications: '肩袖急性疼痛（占位）',
  },
  // 拉
  {
    id: 'single_cable_pulldown',
    name: '单手钢线下拉',
    dayType: 'pull',
    tips: ['先沉肩再屈肘', '肘向髋牵引', '顶峰稍停再慢放'],
    contraindications: '肩上提受限、急性颈痛（占位）',
  },
  {
    id: 'neutral_lat_pulldown',
    name: '对握高位下拉',
    dayType: 'pull',
    tips: ['对握减轻肩压', '胸微挺、下拉至锁骨附近', '避免过度后仰'],
    contraindications: '肩上举受限（占位）',
  },
  {
    id: 'single_machine_row',
    name: '单手器械划船',
    dayType: 'pull',
    tips: ['支撑侧稳定', '肘贴肋后拉', '顶峰挤压肩胛'],
    contraindications: '腰椎急性疼痛（占位）',
  },
  {
    id: 'flared_row',
    name: '开肘划船',
    dayType: 'pull',
    tips: ['肘约 60–75° 打开', '偏上背与后束', '颈保持中立'],
    contraindications: '肩峰撞击症状加重时停用（占位）',
  },
  {
    id: 'cable_curl',
    name: '钢线弯举',
    dayType: 'pull',
    tips: ['肘贴体侧', '腕中立勿甩', '离心慢放'],
    contraindications: '肘内侧/外侧腱病急性期（占位）',
  },
  // 腿
  {
    id: 'single_rdl',
    name: '单腿硬拉',
    dayType: 'legs',
    tips: ['髋铰链主导', '骨盆勿明显旋转', '支撑腿微屈'],
    contraindications: '急性下背、单侧平衡极差（占位）',
  },
  {
    id: 'bulgarian_split_squat',
    name: '保加利亚蹲',
    dayType: 'legs',
    tips: ['重心在前脚', '躯干微前倾', '膝朝向脚尖'],
    contraindications: '前膝急性痛、后脚背过度压迫（占位）',
  },
  {
    id: 'goblet_squat',
    name: '高脚杯深蹲',
    dayType: 'legs',
    tips: ['杯式持铃贴胸', '膝外展与脚尖同向', '蹲至可控深度'],
    contraindications: '急性膝肿痛（占位）',
  },
  {
    id: 'rdl',
    name: 'RDL',
    dayType: 'legs',
    tips: ['杠贴腿下行', '髋后推、背中立', '腘绳肌张力感为主'],
    contraindications: '急性腰椎伤（占位）',
  },
  {
    id: 'back_extension',
    name: '山羊挺身',
    dayType: 'legs',
    tips: ['髋为轴而非腰猛超伸', '顶部臀肌收紧', '动作幅度可控'],
    contraindications: '腰椎滑脱医嘱限制（占位）',
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

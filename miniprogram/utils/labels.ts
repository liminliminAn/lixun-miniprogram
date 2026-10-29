/** 枚举 → 中文展示文案（全站唯一来源；文案取自问卷选项） */
type SexK = 'male' | 'female';
type BandK = 'very_low' | 'low' | 'mid' | 'high';

export const SEX_LABEL: Record<SexK, string> = { male: '男', female: '女' };

export const GOAL_LABEL: Record<'recomp' | 'cut' | 'bulk' | 'beginner', string> = {
  recomp: '增肌减脂',
  cut: '减脂',
  bulk: '增肌',
  beginner: '入门',
};

export const TRAIN_YEARS_LABEL: Record<'lt_half' | 'half_to_2' | 'gt_2', string> = {
  lt_half: '不到半年',
  half_to_2: '半年～2年',
  gt_2: '2年以上',
};

/** 体脂区间：与问卷选项一致（按性别刻度不同） */
export const BF_BAND_TEXT: Record<SexK, Record<BandK, string>> = {
  male: { very_low: '很低（<12%）', low: '较低（12–18%）', mid: '中等（18–25%）', high: '偏高（>25%）' },
  female: { very_low: '很低（<18%）', low: '较低（18–25%）', mid: '中等（25–32%）', high: '偏高（>32%）' },
};

export const JOINT_LIMIT_LABEL = (v: any) => (v ? '有，需保守' : '无');

function pick(map: Record<string, string>, k: any): string {
  return typeof k === 'string' && Object.prototype.hasOwnProperty.call(map, k) ? map[k] : '—';
}

export const sexLabel = (v: any) => pick(SEX_LABEL, v);
export const goalLabel = (v: any) => pick(GOAL_LABEL, v);
export const trainYearsLabel = (v: any) => pick(TRAIN_YEARS_LABEL, v);
export const bfBandLabel = (sex: any, band: any) => pick(BF_BAND_TEXT[sex === 'female' ? 'female' : 'male'], band);

/** 档案展示行（我的页用），全部为中文 */
export function profileLabels(p: any): Record<string, string> {
  if (!p) return {};
  return {
    sex: sexLabel(p.sex),
    bfBand: bfBandLabel(p.sex, p.bfBand),
    goal: goalLabel(p.goal),
    trainYears: trainYearsLabel(p.trainYears),
    jointLimit: JOINT_LIMIT_LABEL(p.jointLimit),
  };
}

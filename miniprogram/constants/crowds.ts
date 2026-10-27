export interface CrowdInfo {
  id: CrowdId;
  name: string;
  summary: string;
  dietPrinciples: string[];
}

/** 人群文案 + 一期饮食原则摘要（饮食 Tab 只读展示） */
export const CROWDS: Record<CrowdId, CrowdInfo> = {
  recomp: {
    id: 'recomp',
    name: '增肌减脂',
    summary: '维持或微亏热量，优先蛋白与力量进度。',
    dietPrinciples: [
      '热量：大致维持或每日微亏 100～200 kcal',
      '蛋白：约 1.6～2.2 g/kg 体重',
      '碳水：训练日略高，休息日略低',
      '脂肪：不少于总热量 20%',
      '（第二期开放宏量目标与食物记录）',
    ],
  },
  cut: {
    id: 'cut',
    name: '减脂',
    summary: '可控赤字，保住力量与肌肉。',
    dietPrinciples: [
      '热量：每日赤字约 300～500 kcal',
      '蛋白：约 1.8～2.4 g/kg 体重，优先保住肌肉',
      '碳水：围训练窗口适当保留',
      '脂肪：不低于总热量 20%',
      '（第二期开放宏量目标与食物记录）',
    ],
  },
  bulk: {
    id: 'bulk',
    name: '增肌',
    summary: '小盈余推进容量与重量。',
    dietPrinciples: [
      '热量：每日盈余约 200～300 kcal',
      '蛋白：约 1.6～2.0 g/kg 体重',
      '碳水：训练日充足，支撑容量',
      '脂肪：约占总热量 20～30%',
      '（第二期开放宏量目标与食物记录）',
    ],
  },
  beginner: {
    id: 'beginner',
    name: '入门',
    summary: '先建立动作与节奏，饮食不过度复杂。',
    dietPrinciples: [
      '先吃稳三餐，少外卖油炸',
      '每餐尽量有蛋白来源（肉蛋奶豆）',
      '训练日保证主食，别空腹硬练',
      '睡眠与水分优先于精细控热',
      '（第二期开放宏量目标与食物记录）',
    ],
  },
};

export const CROWD_LIST: CrowdInfo[] = [
  CROWDS.recomp,
  CROWDS.cut,
  CROWDS.bulk,
  CROWDS.beginner,
];

/** 体脂刻度说明（自报 bfBand） */
export const BF_BAND_LABELS: Record<Sex, { band: BfBand; label: string }[]> = {
  male: [
    { band: 'very_low', label: '很低（<12%）' },
    { band: 'low', label: '较低（12–18%）' },
    { band: 'mid', label: '中等（18–25%）' },
    { band: 'high', label: '偏高（>25%）' },
  ],
  female: [
    { band: 'very_low', label: '很低（<18%）' },
    { band: 'low', label: '较低（18–25%）' },
    { band: 'mid', label: '中等（25–32%）' },
    { band: 'high', label: '偏高（>32%）' },
  ],
};

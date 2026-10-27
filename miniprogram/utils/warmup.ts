/**
 * IT2-06 热身：坡道组计算与热身状态（纯函数）。单测：tests/warmup.test.js
 * 坡道组只写在 session.warmup，不进 session.exercises，因此不计训练容量；
 * 热身状态不影响连练（连练只认 completedAt）。
 */
import { DEFAULT_PROGRESSION, ProgressionConfig } from './progression';

export interface RampConfig {
  emptyBarKg: number;
  roundKg: number;
  steps: { pct: number; reps: number }[];
}

export const DEFAULT_RAMP: RampConfig = {
  emptyBarKg: 20,
  roundKg: 2.5,
  steps: [
    { pct: 0, reps: 10 },
    { pct: 0.4, reps: 8 },
    { pct: 0.6, reps: 5 },
    { pct: 0.8, reps: 3 },
  ],
};

/** 按计划工作重量生成坡道组；pct=0 为空杆。非杠铃动作空杆=0kg。工作重量≤0 → 无坡道组 */
export function rampSets(
  workingKg: number,
  cfg: RampConfig = DEFAULT_RAMP,
  isBarbell = true,
): WarmupRampSet[] {
  if (!(workingKg > 0)) return [];
  const empty = isBarbell ? cfg.emptyBarKg : 0;
  return cfg.steps.map((s) => {
    const raw = s.pct === 0 ? empty : Math.round((workingKg * s.pct) / cfg.roundKg) * cfg.roundKg;
    const weight = Math.min(workingKg, Math.max(empty, raw));
    return { pct: s.pct, reps: s.reps, weight: Math.round(weight * 100) / 100 };
  });
}

/** 当日第一个复合动作 */
export function firstCompound(
  exercises: ExerciseLog[],
  config: ProgressionConfig = DEFAULT_PROGRESSION,
): ExerciseLog | undefined {
  return exercises.find((e) => config.exercises[e.exerciseId]?.kind === 'compound');
}

/** 写入热身状态（返回新对象，不触碰 completedAt / exercises） */
export function withWarmup(session: SessionRecord, warmup: WarmupRecord): SessionRecord {
  return { ...session, warmup: { ...warmup } };
}

/** 连练日期：只认 completedAt */
export function completedTrainDates(sessions: SessionsStore): string[] {
  return Object.keys(sessions)
    .filter((d) => sessions[d] && !!sessions[d].completedAt)
    .sort();
}

/** 未核实的剂量统一展示文案（不展示 dose 原值） */
export const DOSE_PLACEHOLDER = '参考量待定';

export interface WarmupViewItem {
  id: string;
  text: string;
  dose: string;
  source?: { title: string; url: string };
}
export interface WarmupViewSection {
  key: string;
  title: string;
  optional?: boolean;
  items: WarmupViewItem[];
}

/** JSON rampSets → RampConfig；未提供时用 DEFAULT_RAMP */
export function rampConfigFromJson(json: any, base: RampConfig = DEFAULT_RAMP): RampConfig {
  const steps = json && Array.isArray(json.steps) ? json.steps : null;
  if (!steps || !steps.length) return base;
  return {
    ...base,
    steps: steps.map((s: any) => ({
      pct: typeof s.loadPct === 'number' ? s.loadPct / 100 : 0,
      reps: s.reps,
    })),
  };
}

/** 去掉文案里夹带的未核实剂量（如「2–3 分钟」） */
export function stripDose(text: string): string {
  return String(text || '').replace(/\s*\d[\d.–~\-]*\s*(分钟|秒|次|组)\s*/g, '').trim();
}

function mapItems(prefix: string, list: any[]): WarmupViewItem[] {
  return (list || []).map((it, i) => ({
    id: `${prefix}_${i}`,
    text: it.name,
    dose: DOSE_PLACEHOLDER,
    source: it.source ? { title: it.source.title, url: it.source.url } : undefined,
  }));
}

/** 按日类型组装：一般热身 → 放松 → 激活（推日附肩日可选激活） */
export function buildWarmupSections(cfg: any, dayType: string): WarmupViewSection[] {
  const sections: WarmupViewSection[] = [];
  if (cfg.general) {
    sections.push({
      key: 'general',
      title: cfg.general.name || '一般热身',
      items: [{ id: 'general_0', text: stripDose(cfg.general.detail || cfg.general.name), dose: DOSE_PLACEHOLDER }],
    });
  }
  const day = (cfg.days && cfg.days[dayType]) || {};
  if (day.release && day.release.length) {
    sections.push({ key: 'release', title: '放松', items: mapItems(`${dayType}_rel`, day.release) });
  }
  if (day.activate && day.activate.length) {
    sections.push({ key: 'activate', title: '激活', items: mapItems(`${dayType}_act`, day.activate) });
  }
  const sh = cfg.days && cfg.days.shoulder;
  if (dayType === 'push' && sh && sh.activate && sh.activate.length) {
    sections.push({ key: 'shoulder', title: sh.label || '肩部激活（可选）', optional: true, items: mapItems('shoulder_act', sh.activate) });
  }
  return sections;
}

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

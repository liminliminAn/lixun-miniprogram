/** IT2-04 动作图文卡：本地 JSON → 展示模型（纯函数）。单测：tests/exerciseCards.test.js */
import { DOSE_PLACEHOLDER } from './warmup';

export const PLACEHOLDER_IMAGE = '/assets/exercise-placeholder.png';

export interface ExerciseCardView {
  image: string;
  steps: string[];
  cues: string[];
  mistakes: string[];
  dose: string;
}

const strs = (a: any): string[] => (Array.isArray(a) ? a.filter((x) => typeof x === 'string' && x.trim()) : []);

export function buildExerciseCard(cfg: any, exerciseId: string): ExerciseCardView | null {
  const e = cfg && cfg.exercises && cfg.exercises[exerciseId];
  if (!e) return null;
  return {
    image: typeof e.image === 'string' && e.image ? e.image : PLACEHOLDER_IMAGE,
    steps: strs(e.steps),
    cues: strs(e.cues),
    mistakes: strs(e.mistakes),
    dose: e.dose !== undefined && e.dose !== null ? DOSE_PLACEHOLDER : '',
  };
}

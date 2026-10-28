/** IT2-04 动作图文卡：本地 JSON → 展示模型（纯函数）。单测：tests/exerciseCards.test.js */
/** IT2-04 动作卡剂量说明（仅正式组） */
import { DOSE_NOTE } from './warmup';
export const CARD_DOSE_NOTE = DOSE_NOTE;

export interface CardDose { sets: string; repMin: number; repMax: number; effort?: string; rest?: string }

/** dose 对象 → 展示文案，如「3–4 组 × 6–10 次 · 留 2 次余量（RPE≈8） · 组间休息 2–3 分钟」 */
export function formatCardDose(d: any): string {
  if (d && typeof d === 'object' && typeof d.text === 'string' && d.text.trim()) return d.text.trim();
  if (!d || typeof d !== 'object' || !(d.repMin > 0) || !(d.repMax >= d.repMin)) return '';
  return [`${d.sets} 组 × ${d.repMin}–${d.repMax} 次`, d.effort, d.rest].filter(Boolean).join(' · ');
}

export const PLACEHOLDER_IMAGE = '/assets/exercise-placeholder.png';
/** 配图分包根目录；主包页面不能引用分包资源，配图只在分包详情页展示 */
export const IMAGE_SUBPKG_ROOT = 'subpkg/exercises';
export const DETAIL_PAGE = `/${IMAGE_SUBPKG_ROOT}/detail/detail`;

/** 配置里的分包图片路径（/subpkg/exercises/<contentId>.png）；非分包路径返回 '' */
export function subpkgImage(path: unknown): string {
  const p = typeof path === 'string' ? path.trim() : '';
  if (!p) return '';
  const abs = p.charAt(0) === '/' ? p : `/${p}`;
  return abs.indexOf(`/${IMAGE_SUBPKG_ROOT}/`) === 0 && /\.(png|jpg|jpeg|webp)$/.test(abs) ? abs : '';
}

export function detailUrl(exerciseId: string): string {
  return `${DETAIL_PAGE}?id=${encodeURIComponent(exerciseId)}`;
}

export interface ExerciseCardView {
  /** 主包内可显示的图（始终为占位图） */
  image: string;
  /** 分包详情页使用的配图路径；加载失败时详情页回退占位图 */
  detailImage: string;
  detailUrl: string;
  name: string;
  steps: string[];
  cues: string[];
  mistakes: string[];
  dose: string;
  doseNote: string;
}

const strs = (a: any): string[] => (Array.isArray(a) ? a.filter((x) => typeof x === 'string' && x.trim()) : []);

export function buildExerciseCard(cfg: any, exerciseId: string): ExerciseCardView | null {
  const e = cfg && cfg.exercises && cfg.exercises[exerciseId];
  if (!e) return null;
  return {
    image: PLACEHOLDER_IMAGE,
    detailImage: subpkgImage(e.image) || PLACEHOLDER_IMAGE,
    detailUrl: detailUrl(exerciseId),
    name: String(e.name || ''),
    steps: strs(e.steps),
    cues: strs(e.cues),
    mistakes: strs(e.mistakes),
    dose: formatCardDose(e.dose),
    doseNote: formatCardDose(e.dose) ? (cfg._meta && cfg._meta.doseNote) || CARD_DOSE_NOTE : '',
  };
}

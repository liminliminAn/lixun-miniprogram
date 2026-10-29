/** IT2-04 动作图文卡：本地配置 → 展示模型（纯函数）。单测：tests/exerciseCards.test.js */
import { DOSE_NOTE } from './warmup';

/** IT2-04 动作卡剂量说明（仅正式组） */
export const CARD_DOSE_NOTE = DOSE_NOTE;
export const DEFAULT_MEDICAL_NOTE = '出现明显疼痛、麻木或放射痛时停止，并就医确认';

/** 配图分包根目录；主包页面不能引用分包资源，配图只在分包详情页展示 */
export const IMAGE_SUBPKG_ROOT = 'subpkg/exercises';
export const DETAIL_PAGE = `/${IMAGE_SUBPKG_ROOT}/detail/detail`;

export interface CardDose { text?: string; sets?: string; repMin: number; repMax: number }

/** dose → 展示文案 */
export function formatCardDose(d: any): string {
  if (d && typeof d === 'object' && typeof d.text === 'string' && d.text.trim()) return d.text.trim();
  if (!d || typeof d !== 'object' || !(d.repMin > 0) || !(d.repMax >= d.repMin)) return '';
  return `${d.sets} 组 × ${d.repMin}–${d.repMax} 次`;
}

/** 配置里的分包图片路径（/subpkg/exercises/<contentId>.jpg）；非分包路径返回 '' */
/** 图片路径白名单：必须 /subpkg/ 开头、仅 .png/.jpg（不接受 .webp）、不得含 '..'；否则 ''（隐藏图片） */
export function subpkgImage(path: unknown): string {
  const p = typeof path === 'string' ? path.trim() : '';
  return p.indexOf(`/${IMAGE_SUBPKG_ROOT}/`) === 0 && p.indexOf('..') < 0 && /\.(png|jpg)$/.test(p) ? p : '';
}

export function detailUrl(exerciseId: string): string {
  return `${DETAIL_PAGE}?id=${encodeURIComponent(exerciseId)}`;
}

export interface ExerciseCardView {
  name: string;
  /** 有已入库配图（_meta.images 含 contentId）时为分包路径，否则 ''（整块隐藏，不用占位图） */
  detailImage: string;
  hasImage: boolean;
  detailUrl: string;
  steps: string[];
  cues: string[];
  mistakes: string[];
  contraindications: string[];
  dose: string;
  doseNote: string;
  medicalNote: string;
}

const strs = (a: any): string[] => (Array.isArray(a) ? a.filter((x) => typeof x === 'string' && x.trim()) : []);

export function buildExerciseCard(cfg: any, exerciseId: string): ExerciseCardView | null {
  const e = cfg && cfg.exercises && cfg.exercises[exerciseId];
  if (!e) return null;
  const meta = (cfg && cfg._meta) || {};
  const images: string[] = Array.isArray(meta.images) ? meta.images : [];
  const img = subpkgImage(e.image);
  const hasImage = !!img && !!e.contentId && images.indexOf(e.contentId) >= 0;
  const dose = formatCardDose(e.dose);
  return {
    name: String(e.name || ''),
    detailImage: hasImage ? img : '',
    hasImage,
    detailUrl: detailUrl(exerciseId),
    steps: strs(e.steps),
    cues: strs(e.cues),
    mistakes: strs(e.mistakes),
    contraindications: strs(e.contraindications),
    dose,
    doseNote: dose ? meta.doseNote || CARD_DOSE_NOTE : '',
    medicalNote: (meta.displayRules && meta.displayRules.medicalNote) || DEFAULT_MEDICAL_NOTE,
  };
}

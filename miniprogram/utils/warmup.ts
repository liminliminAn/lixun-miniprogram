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

/** 全站唯一剂量说明文案（tests/doseNote.test.js 扫描防变体） */
export const DOSE_NOTE = '剂量为通用建议，因人而异';
/** BUG-A：剂量旁标注，来源链接只挂动作本身 */
export const DOSE_LABEL = DOSE_NOTE;
export const PICK_NOTE = '热身动作按需挑选，不必全做';

/** 配置 _meta 的剂量说明 / 挑选说明（缺省回退常量） */
export function contentNotes(cfg: any): { doseNote: string; pickNote: string } {
  const m = (cfg && cfg._meta) || {};
  return { doseNote: m.doseNote || DOSE_NOTE, pickNote: m.pickNote || PICK_NOTE };
}

export interface WarmupViewItem {
  id: string;
  text: string;
  dose: string;
  source?: { title: string; url: string };
  steps?: string[];
  cues?: string[];
  /** 分包图解路径（/subpkg/exercises/*.webp）；为空时不显示「查看图解 ›」入口 */
  figure?: string;
  video?: WarmupVideo | null;
}
export interface WarmupVideo { url: string; time: string; note: string; copyText: string }
export const VIDEO_TOAST = '已复制，可在抖音打开';

/** video {url,time} → 可点按复制的一行；复制内容为「<url> <time>」，不内嵌 */
export function videoLine(v: any): WarmupVideo | null {
  if (!v || typeof v.url !== 'string' || !/^https:\/\//.test(v.url)) return null;
  const time = v.time ? String(v.time) : '';
  return { url: v.url, time, note: v.note ? String(v.note) : '', copyText: time ? `${v.url} ${time}` : v.url };
}

/** 分包图解路径白名单：必须 /subpkg/ 开头、仅 .webp/.png/.jpg、不得含 '..'；否则 ''（隐藏图片） */
export function subpkgFigure(img: unknown): string {
  const p = typeof img === 'string' ? img.trim() : '';
  return p.indexOf('/subpkg/') === 0 && p.indexOf('..') < 0 && /\.(webp|png|jpg)$/.test(p) ? p : '';
}
export const FIGURE_EMPTY_HINT = '没有可显示的图解内容';
export const WARMUP_FIGURE_PAGE = '/subpkg/exercises/warmup-figure/warmup-figure';
export const POSTURE_FIGURE_PAGE = '/subpkg/exercises/posture-figure/posture-figure';
/** 跳转分包图解页的 url（img/title/cue 均 encode） */
export function figureUrl(page: string, img: string, title: string, cue?: string): string {
  const q = [`img=${encodeURIComponent(img)}`, `title=${encodeURIComponent(title || '')}`];
  if (cue) q.push(`cue=${encodeURIComponent(cue)}`);
  return `${page}?${q.join('&')}`;
}

const strList = (a: any): string[] => (Array.isArray(a) ? a.filter((x) => typeof x === 'string' && x.trim()) : []);
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

function mapItems(prefix: string, list: any[]): WarmupViewItem[] {
  return (list || []).map((it, i) => ({
    id: `${prefix}_${i}`,
    text: it.name,
    dose: it.dose ? String(it.dose) : '',
    source: it.source ? { title: `参考来源 · ${it.source.title}`, url: it.source.url } : undefined,
    steps: strList(it.steps),
    cues: strList(it.cues),
    figure: subpkgFigure(it.image),
    video: videoLine(it.video),
  }));
}

/** 按日类型组装：一般热身 → 放松 → 激活（推日附肩日可选激活） */
export function buildWarmupSections(cfg: any, dayType: string): WarmupViewSection[] {
  const sections: WarmupViewSection[] = [];
  if (cfg.general) {
    sections.push({
      key: 'general',
      title: cfg.general.name || '一般热身',
      items: [{ id: 'general_0', text: String(cfg.general.detail || cfg.general.name), dose: cfg.general.dose ? String(cfg.general.dose) : '' }],
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

/**
 * IT2-05 体态矫正：把本地 posture 配置组装成展示模型（纯函数）。单测：tests/posture.test.js
 * - precheck 与 disclaimer 总是展示；selfCheck 为 null 时隐藏自查
 * - it2-v2：展示配置里的真实 dose / frequency；_meta.doseNote 与 pickNote 一并展示
 * - placement（如 "warmup.push,warmup.pull"）决定加入哪些热身日
 * - 仅 attribution === 'tan' 的条目可展示来源；永不显示作者名，sourceText 一律「参考来源 · {title}」；generic 不显示作者与来源
 * - 来源链接仅作可复制的纯文本
 * - 就医提示从 disclaimer 拆出，页面默认展开
 */
import { DOSE_NOTE, PICK_NOTE, subpkgFigure } from './warmup';

export const TAN_AUTHOR = '谭成义'; // 仅供单测断言「不得出现」；展示层永不输出
export const SOURCE_LABEL = '参考来源';
export const COPY_TOAST = '链接已复制，请到浏览器打开';
export const MEDICAL_TIP_TITLE = '就医提示';
export const SHORT_DISCLAIMER = '非医疗建议。';

export interface PostureDrillView {
  name: string;
  cue: string;
  dose: string;
  /** 分包图解路径；为空时不显示入口 */
  figure: string;
}

export interface PostureIssueView {
  selfCheckFigure: string;
  id: string;
  title: string;
  precheck: string;
  showSelfCheck: boolean;
  selfCheck: string;
  pre: PostureDrillView[];
  drills: PostureDrillView[];
  frequency: string;
  placeholder: boolean;
  author: string;
  sourceText: string;
  sourceUrl: string;
  medicalNote: string;
}

export interface PostureView {
  disclaimer: string;
  shortDisclaimer: string;
  medicalTipTitle: string;
  medicalTip: string;
  doseNote: string;
  pickNote: string;
  issues: PostureIssueView[];
}

const DEFAULT_PRECHECK = '先排除外伤、急性疼痛与神经症状，再做矫正练习';
const DEFAULT_MEDICAL =
  '出现麻木、放射痛、夜间痛、外伤后疼痛，或持续 2 周不缓解，请就医。';

function drill(d: any): PostureDrillView {
  return { name: String(d.name || ''), cue: d.cue ? String(d.cue) : '', dose: d.dose ? String(d.dose) : '', figure: subpkgFigure(d.image) };
}

/** 从完整 disclaimer 拆出短免责声明与就医触发条件 */
export function splitDisclaimer(raw: string): { shortDisclaimer: string; medicalTip: string } {
  const text = (raw || '').trim() || `${SHORT_DISCLAIMER}${DEFAULT_MEDICAL}`;
  const markers = ['出现', '麻木'];
  let idx = -1;
  for (const m of markers) {
    const i = text.indexOf(m);
    if (i >= 0 && (idx < 0 || i < idx)) idx = i;
  }
  if (idx > 0) {
    return {
      shortDisclaimer: text.slice(0, idx).trim() || SHORT_DISCLAIMER,
      medicalTip: text.slice(idx).trim(),
    };
  }
  return { shortDisclaimer: SHORT_DISCLAIMER, medicalTip: text.includes('就医') ? text : DEFAULT_MEDICAL };
}

/** selfCheck 可为字符串或 { name, how, flag } */
export function formatSelfCheck(sc: any): string {
  if (!sc) return '';
  if (typeof sc === 'string') return sc;
  const head = sc.name ? `${sc.name}：` : '';
  return `${head}${[sc.how, sc.flag].filter(Boolean).join('。')}`;
}

/** placement "warmup.push,warmup.pull" → ['push','pull'] */
export function placementDays(placement: unknown): string[] {
  return String(placement || '')
    .split(',')
    .map((x) => x.trim())
    .filter((x) => x.indexOf('warmup.') === 0)
    .map((x) => x.slice('warmup.'.length))
    .filter(Boolean);
}

export function buildPostureView(json: any): PostureView {
  const issues = ((json && json.issues) || [])
    .filter((it: any) => it && it.visible !== false) // D3：visible=false 完全隐藏
    .slice()
    .sort((a: any, b: any) => (a.priority || 99) - (b.priority || 99))
    .map((it: any): PostureIssueView => {
      const tan = it.attribution === 'tan';
      const src = tan && it.source ? it.source : null;
      return {
        id: it.id,
        title: it.title,
        precheck: it.precheck || DEFAULT_PRECHECK,
        showSelfCheck: it.selfCheck !== null && it.selfCheck !== undefined,
        selfCheck: formatSelfCheck(it.selfCheck),
        selfCheckFigure: it.selfCheck && typeof it.selfCheck === 'object' ? subpkgFigure(it.selfCheck.image) : '',
        pre: (it.pre || []).map(drill),
        drills: (it.drills || []).map(drill),
        frequency: it.placeholder ? '' : String(it.frequency || ''),
        placeholder: !!it.placeholder,
        // 永不署名；有来源时一律「参考来源 · title」
        author: '',
        sourceText: src ? `${SOURCE_LABEL} · ${src.title}` : '',
        sourceUrl: src ? String(src.url) : '',
        medicalNote: it.medicalNote ? String(it.medicalNote) : '',
      };
    });
  const rawDisclaimer = (json && json._meta && json._meta.disclaimer) || `${SHORT_DISCLAIMER}${DEFAULT_MEDICAL}`;
  const { shortDisclaimer, medicalTip } = splitDisclaimer(rawDisclaimer);
  return {
    disclaimer: rawDisclaimer,
    shortDisclaimer,
    medicalTipTitle: MEDICAL_TIP_TITLE,
    medicalTip,
    doseNote: (json && json._meta && json._meta.doseNote) || DOSE_NOTE,
    pickNote: (json && json._meta && json._meta.pickNote) || PICK_NOTE,
    issues,
  };
}

/** 热身附加：按条目 placement 加入对应日（推/拉）激活段之后，可选，不影响热身完成判定 */
export function shoulderWarmupAddon(json: any, dayType: string): {
  key: string; title: string; optional: true; frequency: string;
  items: { id: string; text: string; dose: string; source?: { title: string; url: string } }[];
} | null {
  const issues = ((json && json.issues) || []).filter(
    (it: any) => it.attribution === 'tan' && !it.placeholder && placementDays(it.placement).indexOf(dayType) >= 0,
  );
  const items: { id: string; text: string; dose: string; source?: { title: string; url: string } }[] = [];
  let frequency = '';
  issues.forEach((it: any) => {
    if (!frequency && it.frequency) frequency = String(it.frequency);
    const src = it.source ? { title: `${SOURCE_LABEL} · ${it.source.title}`, url: String(it.source.url) } : undefined;
    [...(it.pre || []), ...(it.drills || [])].forEach((d: any, i: number) => {
      items.push({ id: `posture_${it.id}_${i}`, text: String(d.name), dose: d.dose ? String(d.dose) : '', source: src });
    });
  });
  return items.length ? { key: 'posture_shoulder', title: '肩部矫正加做（可选）', optional: true, frequency, items } : null;
}

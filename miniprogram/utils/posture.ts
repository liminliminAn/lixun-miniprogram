/**
 * IT2-05 体态矫正：把本地 posture 配置组装成展示模型（纯函数）。单测：tests/posture.test.js
 * - precheck 与 disclaimer 总是展示；selfCheck 为 null 时隐藏自查
 * - 所有 dose / frequency 显示「参考量待定」
 * - 仅 attribution === 'tan' 的条目可展示来源；永不显示作者名，sourceText 一律「参考来源 · {title}」；generic 不显示作者与来源
 * - 来源链接仅作可复制的纯文本
 * - 就医提示从 disclaimer 拆出，页面默认展开
 */
import { DOSE_PLACEHOLDER } from './warmup';

export const TAN_AUTHOR = '谭成义'; // 仅供单测断言「不得出现」；展示层永不输出
export const SOURCE_LABEL = '参考来源';
export const COPY_TOAST = '链接已复制，请到浏览器打开';
export const MEDICAL_TIP_TITLE = '就医提示';
export const SHORT_DISCLAIMER = '非医疗建议。';

export interface PostureDrillView {
  name: string;
  cue: string;
  dose: string;
}

export interface PostureIssueView {
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
}

export interface PostureView {
  disclaimer: string;
  shortDisclaimer: string;
  medicalTipTitle: string;
  medicalTip: string;
  issues: PostureIssueView[];
}

const DEFAULT_PRECHECK = '先排除外伤、急性疼痛与神经症状，再做矫正练习';
const DEFAULT_MEDICAL =
  '出现麻木、放射痛、夜间痛、外伤后疼痛，或持续 2 周不缓解，请就医。';

function drill(d: any): PostureDrillView {
  const cue = d.cue && !String(d.cue).includes('待核实') ? String(d.cue) : '';
  return { name: String(d.name || ''), cue, dose: DOSE_PLACEHOLDER };
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

export function buildPostureView(json: any): PostureView {
  const issues = ((json && json.issues) || [])
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
        selfCheck: it.selfCheck ? String(it.selfCheck) : '',
        pre: (it.pre || []).map(drill),
        drills: (it.drills || []).map(drill),
        frequency: DOSE_PLACEHOLDER,
        placeholder: !!it.placeholder,
        // 永不署名；有来源时一律「参考来源 · title」
        author: '',
        sourceText: src ? `${SOURCE_LABEL} · ${src.title}` : '',
        sourceUrl: src ? String(src.url) : '',
      };
    });
  const rawDisclaimer = (json && json._meta && json._meta.disclaimer) || `${SHORT_DISCLAIMER}${DEFAULT_MEDICAL}`;
  const { shortDisclaimer, medicalTip } = splitDisclaimer(rawDisclaimer);
  return {
    disclaimer: rawDisclaimer,
    shortDisclaimer,
    medicalTipTitle: MEDICAL_TIP_TITLE,
    medicalTip,
    issues,
  };
}

/** 热身附加：推/拉日激活段可选加做 attribution=tan 的肩部条目（不影响热身完成判定） */
export const SHOULDER_ADDON_DAYS = ['push', 'pull'];

export function shoulderWarmupAddon(json: any, dayType: string): {
  key: string; title: string; optional: true;
  items: { id: string; text: string; dose: string; source?: { title: string; url: string } }[];
} | null {
  if (SHOULDER_ADDON_DAYS.indexOf(dayType) < 0) return null;
  const issues = ((json && json.issues) || []).filter(
    (it: any) => it.attribution === 'tan' && String(it.id).indexOf('shoulder') === 0,
  );
  const items: { id: string; text: string; dose: string; source?: { title: string; url: string } }[] = [];
  issues.forEach((it: any) => {
    const src = it.source ? { title: `${SOURCE_LABEL} · ${it.source.title}`, url: String(it.source.url) } : undefined;
    [...(it.pre || []), ...(it.drills || [])].forEach((d: any, i: number) => {
      items.push({ id: `posture_${it.id}_${i}`, text: String(d.name), dose: DOSE_PLACEHOLDER, source: src });
    });
  });
  return items.length ? { key: 'posture_shoulder', title: '肩部加做（可选）', optional: true, items } : null;
}

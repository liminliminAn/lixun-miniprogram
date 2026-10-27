/**
 * IT2-05 体态矫正：把本地 posture.json 组装成展示模型（纯函数）。单测：tests/posture.test.js
 * - precheck 与 disclaimer 总是展示；selfCheck 为 null 时隐藏自查
 * - 所有 dose / frequency 显示「参考量待定」
 * - 仅 attribution === 'tan' 的条目可展示作者与来源；generic 不显示作者
 * - 来源链接仅作可复制的纯文本
 */
import { DOSE_PLACEHOLDER } from './warmup';

export const TAN_AUTHOR = '谭成义';

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
  issues: PostureIssueView[];
}

const DEFAULT_PRECHECK = '先排除外伤、急性疼痛与神经症状，再做矫正练习';

function drill(d: any): PostureDrillView {
  const cue = d.cue && !String(d.cue).includes('待核实') ? String(d.cue) : '';
  return { name: String(d.name || ''), cue, dose: DOSE_PLACEHOLDER };
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
        author: tan ? TAN_AUTHOR : '',
        sourceText: src ? `${TAN_AUTHOR} · ${src.title}` : '',
        sourceUrl: src ? String(src.url) : '',
      };
    });
  return {
    disclaimer: (json && json._meta && json._meta.disclaimer) || '非医疗建议。',
    issues,
  };
}

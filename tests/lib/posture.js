"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SHORT_DISCLAIMER = exports.MEDICAL_TIP_TITLE = exports.COPY_TOAST = exports.SOURCE_LABEL = exports.TAN_AUTHOR = void 0;
exports.splitDisclaimer = splitDisclaimer;
exports.formatSelfCheck = formatSelfCheck;
exports.placementDays = placementDays;
exports.buildPostureView = buildPostureView;
exports.shoulderWarmupAddon = shoulderWarmupAddon;
/**
 * IT2-05 体态矫正：把本地 posture 配置组装成展示模型（纯函数）。单测：tests/posture.test.js
 * - precheck 与 disclaimer 总是展示；selfCheck 为 null 时隐藏自查
 * - it2-v2：展示配置里的真实 dose / frequency；_meta.doseNote 与 pickNote 一并展示
 * - placement（如 "warmup.push,warmup.pull"）决定加入哪些热身日
 * - 仅 attribution === 'tan' 的条目可展示来源；永不显示作者名，sourceText 一律「参考来源 · {title}」；generic 不显示作者与来源
 * - 来源链接仅作可复制的纯文本
 * - 就医提示从 disclaimer 拆出，页面默认展开
 */
const warmup_1 = require("./warmup");
exports.TAN_AUTHOR = '谭成义'; // 仅供单测断言「不得出现」；展示层永不输出
exports.SOURCE_LABEL = '参考来源';
exports.COPY_TOAST = '链接已复制，请到浏览器打开';
exports.MEDICAL_TIP_TITLE = '就医提示';
exports.SHORT_DISCLAIMER = '非医疗建议。';
const DEFAULT_PRECHECK = '先排除外伤、急性疼痛与神经症状，再做矫正练习';
const DEFAULT_MEDICAL = '出现麻木、放射痛、夜间痛、外伤后疼痛，或持续 2 周不缓解，请就医。';
function drill(d) {
    return { name: String(d.name || ''), cue: d.cue ? String(d.cue) : '', dose: d.dose ? String(d.dose) : '' };
}
/** 从完整 disclaimer 拆出短免责声明与就医触发条件 */
function splitDisclaimer(raw) {
    const text = (raw || '').trim() || `${exports.SHORT_DISCLAIMER}${DEFAULT_MEDICAL}`;
    const markers = ['出现', '麻木'];
    let idx = -1;
    for (const m of markers) {
        const i = text.indexOf(m);
        if (i >= 0 && (idx < 0 || i < idx))
            idx = i;
    }
    if (idx > 0) {
        return {
            shortDisclaimer: text.slice(0, idx).trim() || exports.SHORT_DISCLAIMER,
            medicalTip: text.slice(idx).trim(),
        };
    }
    return { shortDisclaimer: exports.SHORT_DISCLAIMER, medicalTip: text.includes('就医') ? text : DEFAULT_MEDICAL };
}
/** selfCheck 可为字符串或 { name, how, flag } */
function formatSelfCheck(sc) {
    if (!sc)
        return '';
    if (typeof sc === 'string')
        return sc;
    const head = sc.name ? `${sc.name}：` : '';
    return `${head}${[sc.how, sc.flag].filter(Boolean).join('。')}`;
}
/** placement "warmup.push,warmup.pull" → ['push','pull'] */
function placementDays(placement) {
    return String(placement || '')
        .split(',')
        .map((x) => x.trim())
        .filter((x) => x.indexOf('warmup.') === 0)
        .map((x) => x.slice('warmup.'.length))
        .filter(Boolean);
}
function buildPostureView(json) {
    const issues = ((json && json.issues) || [])
        .slice()
        .sort((a, b) => (a.priority || 99) - (b.priority || 99))
        .map((it) => {
        const tan = it.attribution === 'tan';
        const src = tan && it.source ? it.source : null;
        return {
            id: it.id,
            title: it.title,
            precheck: it.precheck || DEFAULT_PRECHECK,
            showSelfCheck: it.selfCheck !== null && it.selfCheck !== undefined,
            selfCheck: formatSelfCheck(it.selfCheck),
            pre: (it.pre || []).map(drill),
            drills: (it.drills || []).map(drill),
            frequency: it.placeholder ? '' : String(it.frequency || ''),
            placeholder: !!it.placeholder,
            // 永不署名；有来源时一律「参考来源 · title」
            author: '',
            sourceText: src ? `${exports.SOURCE_LABEL} · ${src.title}` : '',
            sourceUrl: src ? String(src.url) : '',
        };
    });
    const rawDisclaimer = (json && json._meta && json._meta.disclaimer) || `${exports.SHORT_DISCLAIMER}${DEFAULT_MEDICAL}`;
    const { shortDisclaimer, medicalTip } = splitDisclaimer(rawDisclaimer);
    return {
        disclaimer: rawDisclaimer,
        shortDisclaimer,
        medicalTipTitle: exports.MEDICAL_TIP_TITLE,
        medicalTip,
        doseNote: (json && json._meta && json._meta.doseNote) || warmup_1.DOSE_NOTE,
        pickNote: (json && json._meta && json._meta.pickNote) || warmup_1.PICK_NOTE,
        issues,
    };
}
/** 热身附加：按条目 placement 加入对应日（推/拉）激活段之后，可选，不影响热身完成判定 */
function shoulderWarmupAddon(json, dayType) {
    const issues = ((json && json.issues) || []).filter((it) => it.attribution === 'tan' && !it.placeholder && placementDays(it.placement).indexOf(dayType) >= 0);
    const items = [];
    let frequency = '';
    issues.forEach((it) => {
        if (!frequency && it.frequency)
            frequency = String(it.frequency);
        const src = it.source ? { title: `${exports.SOURCE_LABEL} · ${it.source.title}`, url: String(it.source.url) } : undefined;
        [...(it.pre || []), ...(it.drills || [])].forEach((d, i) => {
            items.push({ id: `posture_${it.id}_${i}`, text: String(d.name), dose: d.dose ? String(d.dose) : '', source: src });
        });
    });
    return items.length ? { key: 'posture_shoulder', title: '肩部矫正加做（可选）', optional: true, frequency, items } : null;
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SHOULDER_ADDON_DAYS = exports.SHORT_DISCLAIMER = exports.MEDICAL_TIP_TITLE = exports.COPY_TOAST = exports.SOURCE_LABEL = exports.TAN_AUTHOR = void 0;
exports.splitDisclaimer = splitDisclaimer;
exports.buildPostureView = buildPostureView;
exports.shoulderWarmupAddon = shoulderWarmupAddon;
/**
 * IT2-05 体态矫正：把本地 posture 配置组装成展示模型（纯函数）。单测：tests/posture.test.js
 * - precheck 与 disclaimer 总是展示；selfCheck 为 null 时隐藏自查
 * - 所有 dose / frequency 显示「参考量待定」
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
    const cue = d.cue && !String(d.cue).includes('待核实') ? String(d.cue) : '';
    return { name: String(d.name || ''), cue, dose: warmup_1.DOSE_PLACEHOLDER };
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
            selfCheck: it.selfCheck ? String(it.selfCheck) : '',
            pre: (it.pre || []).map(drill),
            drills: (it.drills || []).map(drill),
            frequency: warmup_1.DOSE_PLACEHOLDER,
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
        issues,
    };
}
/** 热身附加：推/拉日激活段可选加做 attribution=tan 的肩部条目（不影响热身完成判定） */
exports.SHOULDER_ADDON_DAYS = ['push', 'pull'];
function shoulderWarmupAddon(json, dayType) {
    if (exports.SHOULDER_ADDON_DAYS.indexOf(dayType) < 0)
        return null;
    const issues = ((json && json.issues) || []).filter((it) => it.attribution === 'tan' && String(it.id).indexOf('shoulder') === 0);
    const items = [];
    issues.forEach((it) => {
        const src = it.source ? { title: `${exports.SOURCE_LABEL} · ${it.source.title}`, url: String(it.source.url) } : undefined;
        [...(it.pre || []), ...(it.drills || [])].forEach((d, i) => {
            items.push({ id: `posture_${it.id}_${i}`, text: String(d.name), dose: warmup_1.DOSE_PLACEHOLDER, source: src });
        });
    });
    return items.length ? { key: 'posture_shoulder', title: '肩部加做（可选）', optional: true, items } : null;
}

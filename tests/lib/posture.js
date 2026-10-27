"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SHOULDER_ADDON_DAYS = exports.COPY_TOAST = exports.SOURCE_LABEL = exports.TAN_AUTHOR = void 0;
exports.buildPostureView = buildPostureView;
exports.shoulderWarmupAddon = shoulderWarmupAddon;
/**
 * IT2-05 体态矫正：把本地 posture.json 组装成展示模型（纯函数）。单测：tests/posture.test.js
 * - precheck 与 disclaimer 总是展示；selfCheck 为 null 时隐藏自查
 * - 所有 dose / frequency 显示「参考量待定」
 * - 仅 attribution === 'tan' 的条目可展示来源；且仅 verified===true 时显示作者名，未核实只显示「参考来源」；generic 不显示作者与来源
 * - 来源链接仅作可复制的纯文本
 */
const warmup_1 = require("./warmup");
exports.TAN_AUTHOR = '谭成义';
exports.SOURCE_LABEL = '参考来源';
exports.COPY_TOAST = '链接已复制，请到浏览器打开';
const DEFAULT_PRECHECK = '先排除外伤、急性疼痛与神经症状，再做矫正练习';
function drill(d) {
    const cue = d.cue && !String(d.cue).includes('待核实') ? String(d.cue) : '';
    return { name: String(d.name || ''), cue, dose: warmup_1.DOSE_PLACEHOLDER };
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
            // 署名仅限 tan 且已核实（verified===true）；未核实只显示「参考来源」
            author: tan && it.verified === true ? exports.TAN_AUTHOR : '',
            sourceText: src ? (it.verified === true ? `${exports.TAN_AUTHOR} · ${src.title}` : `${exports.SOURCE_LABEL} · ${src.title}`) : '',
            sourceUrl: src ? String(src.url) : '',
        };
    });
    return {
        disclaimer: (json && json._meta && json._meta.disclaimer) || '非医疗建议。',
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
        const label = it.verified === true ? exports.TAN_AUTHOR : exports.SOURCE_LABEL;
        const src = it.source ? { title: `${label} · ${it.source.title}`, url: String(it.source.url) } : undefined;
        [...(it.pre || []), ...(it.drills || [])].forEach((d, i) => {
            items.push({ id: `posture_${it.id}_${i}`, text: String(d.name), dose: warmup_1.DOSE_PLACEHOLDER, source: src });
        });
    });
    return items.length ? { key: 'posture_shoulder', title: '肩部加做（可选）', optional: true, items } : null;
}

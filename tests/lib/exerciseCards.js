"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLACEHOLDER_IMAGE = exports.CARD_DOSE_NOTE = void 0;
exports.formatCardDose = formatCardDose;
exports.buildExerciseCard = buildExerciseCard;
/** IT2-04 动作图文卡：本地 JSON → 展示模型（纯函数）。单测：tests/exerciseCards.test.js */
/** IT2-04 动作卡剂量说明（仅正式组） */
exports.CARD_DOSE_NOTE = '通用建议，因人而异';
/** dose 对象 → 展示文案，如「3–4 组 × 6–10 次 · 留 2 次余量（RPE≈8） · 组间休息 2–3 分钟」 */
function formatCardDose(d) {
    if (!d || typeof d !== 'object' || !(d.repMin > 0) || !(d.repMax >= d.repMin))
        return '';
    return [`${d.sets} 组 × ${d.repMin}–${d.repMax} 次`, d.effort, d.rest].filter(Boolean).join(' · ');
}
exports.PLACEHOLDER_IMAGE = '/assets/exercise-placeholder.png';
const strs = (a) => (Array.isArray(a) ? a.filter((x) => typeof x === 'string' && x.trim()) : []);
function buildExerciseCard(cfg, exerciseId) {
    const e = cfg && cfg.exercises && cfg.exercises[exerciseId];
    if (!e)
        return null;
    return {
        image: typeof e.image === 'string' && e.image ? e.image : exports.PLACEHOLDER_IMAGE,
        steps: strs(e.steps),
        cues: strs(e.cues),
        mistakes: strs(e.mistakes),
        dose: formatCardDose(e.dose),
        doseNote: formatCardDose(e.dose) ? (cfg._meta && cfg._meta.doseNote) || exports.CARD_DOSE_NOTE : '',
    };
}

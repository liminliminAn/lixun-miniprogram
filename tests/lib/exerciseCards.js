"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DETAIL_PAGE = exports.IMAGE_SUBPKG_ROOT = exports.PLACEHOLDER_IMAGE = exports.CARD_DOSE_NOTE = void 0;
exports.formatCardDose = formatCardDose;
exports.subpkgImage = subpkgImage;
exports.detailUrl = detailUrl;
exports.buildExerciseCard = buildExerciseCard;
/** IT2-04 动作图文卡：本地 JSON → 展示模型（纯函数）。单测：tests/exerciseCards.test.js */
/** IT2-04 动作卡剂量说明（仅正式组） */
const warmup_1 = require("./warmup");
exports.CARD_DOSE_NOTE = warmup_1.DOSE_NOTE;
/** dose 对象 → 展示文案，如「3–4 组 × 6–10 次 · 留 2 次余量（RPE≈8） · 组间休息 2–3 分钟」 */
function formatCardDose(d) {
    if (d && typeof d === 'object' && typeof d.text === 'string' && d.text.trim())
        return d.text.trim();
    if (!d || typeof d !== 'object' || !(d.repMin > 0) || !(d.repMax >= d.repMin))
        return '';
    return [`${d.sets} 组 × ${d.repMin}–${d.repMax} 次`, d.effort, d.rest].filter(Boolean).join(' · ');
}
exports.PLACEHOLDER_IMAGE = '/assets/exercise-placeholder.png';
/** 配图分包根目录；主包页面不能引用分包资源，配图只在分包详情页展示 */
exports.IMAGE_SUBPKG_ROOT = 'subpkg/exercises';
exports.DETAIL_PAGE = `/${exports.IMAGE_SUBPKG_ROOT}/detail/detail`;
/** 配置里的分包图片路径（/subpkg/exercises/<contentId>.png）；非分包路径返回 '' */
function subpkgImage(path) {
    const p = typeof path === 'string' ? path.trim() : '';
    if (!p)
        return '';
    const abs = p.charAt(0) === '/' ? p : `/${p}`;
    return abs.indexOf(`/${exports.IMAGE_SUBPKG_ROOT}/`) === 0 && /\.(png|jpg|jpeg|webp)$/.test(abs) ? abs : '';
}
function detailUrl(exerciseId) {
    return `${exports.DETAIL_PAGE}?id=${encodeURIComponent(exerciseId)}`;
}
const strs = (a) => (Array.isArray(a) ? a.filter((x) => typeof x === 'string' && x.trim()) : []);
function buildExerciseCard(cfg, exerciseId) {
    const e = cfg && cfg.exercises && cfg.exercises[exerciseId];
    if (!e)
        return null;
    return {
        image: exports.PLACEHOLDER_IMAGE,
        detailImage: subpkgImage(e.image) || exports.PLACEHOLDER_IMAGE,
        detailUrl: detailUrl(exerciseId),
        name: String(e.name || ''),
        steps: strs(e.steps),
        cues: strs(e.cues),
        mistakes: strs(e.mistakes),
        dose: formatCardDose(e.dose),
        doseNote: formatCardDose(e.dose) ? (cfg._meta && cfg._meta.doseNote) || exports.CARD_DOSE_NOTE : '',
    };
}

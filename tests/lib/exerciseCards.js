"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DETAIL_PAGE = exports.IMAGE_SUBPKG_ROOT = exports.DEFAULT_MEDICAL_NOTE = exports.CARD_DOSE_NOTE = void 0;
exports.formatCardDose = formatCardDose;
exports.subpkgImage = subpkgImage;
exports.detailUrl = detailUrl;
exports.buildExerciseCard = buildExerciseCard;
/** IT2-04 动作图文卡：本地配置 → 展示模型（纯函数）。单测：tests/exerciseCards.test.js */
const warmup_1 = require("./warmup");
/** IT2-04 动作卡剂量说明（仅正式组） */
exports.CARD_DOSE_NOTE = warmup_1.DOSE_NOTE;
exports.DEFAULT_MEDICAL_NOTE = '出现明显疼痛、麻木或放射痛时停止，并就医确认';
/** 配图分包根目录；主包页面不能引用分包资源，配图只在分包详情页展示 */
exports.IMAGE_SUBPKG_ROOT = 'subpkg/exercises';
exports.DETAIL_PAGE = `/${exports.IMAGE_SUBPKG_ROOT}/detail/detail`;
/** dose → 展示文案 */
function formatCardDose(d) {
    if (d && typeof d === 'object' && typeof d.text === 'string' && d.text.trim())
        return d.text.trim();
    if (!d || typeof d !== 'object' || !(d.repMin > 0) || !(d.repMax >= d.repMin))
        return '';
    return `${d.sets} 组 × ${d.repMin}–${d.repMax} 次`;
}
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
    const meta = (cfg && cfg._meta) || {};
    const images = Array.isArray(meta.images) ? meta.images : [];
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
        doseNote: dose ? meta.doseNote || exports.CARD_DOSE_NOTE : '',
        medicalNote: (meta.displayRules && meta.displayRules.medicalNote) || exports.DEFAULT_MEDICAL_NOTE,
    };
}

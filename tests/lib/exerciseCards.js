"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLACEHOLDER_IMAGE = exports.DOSE_PLACEHOLDER = void 0;
exports.buildExerciseCard = buildExerciseCard;
/** IT2-04 动作图文卡：本地 JSON → 展示模型（纯函数）。单测：tests/exerciseCards.test.js */
/** IT2-04 动作卡剂量尚未定稿，保持占位 */
exports.DOSE_PLACEHOLDER = '参考量待定';
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
        dose: e.dose !== undefined && e.dose !== null ? exports.DOSE_PLACEHOLDER : '',
    };
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLACEHOLDER_IMAGE = void 0;
exports.buildExerciseCard = buildExerciseCard;
/** IT2-04 动作图文卡：本地 JSON → 展示模型（纯函数）。单测：tests/exerciseCards.test.js */
const warmup_1 = require("./warmup");
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
        dose: e.dose !== undefined && e.dose !== null ? warmup_1.DOSE_PLACEHOLDER : '',
    };
}

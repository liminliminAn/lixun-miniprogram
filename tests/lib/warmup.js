"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_RAMP = void 0;
exports.rampSets = rampSets;
exports.firstCompound = firstCompound;
exports.withWarmup = withWarmup;
exports.completedTrainDates = completedTrainDates;
/**
 * IT2-06 热身：坡道组计算与热身状态（纯函数）。单测：tests/warmup.test.js
 * 坡道组只写在 session.warmup，不进 session.exercises，因此不计训练容量；
 * 热身状态不影响连练（连练只认 completedAt）。
 */
const progression_1 = require("./progression");
exports.DEFAULT_RAMP = {
    emptyBarKg: 20,
    roundKg: 2.5,
    steps: [
        { pct: 0, reps: 10 },
        { pct: 0.4, reps: 8 },
        { pct: 0.6, reps: 5 },
        { pct: 0.8, reps: 3 },
    ],
};
/** 按计划工作重量生成坡道组；pct=0 为空杆。非杠铃动作空杆=0kg。工作重量≤0 → 无坡道组 */
function rampSets(workingKg, cfg = exports.DEFAULT_RAMP, isBarbell = true) {
    if (!(workingKg > 0))
        return [];
    const empty = isBarbell ? cfg.emptyBarKg : 0;
    return cfg.steps.map((s) => {
        const raw = s.pct === 0 ? empty : Math.round((workingKg * s.pct) / cfg.roundKg) * cfg.roundKg;
        const weight = Math.min(workingKg, Math.max(empty, raw));
        return { pct: s.pct, reps: s.reps, weight: Math.round(weight * 100) / 100 };
    });
}
/** 当日第一个复合动作 */
function firstCompound(exercises, config = progression_1.DEFAULT_PROGRESSION) {
    return exercises.find((e) => { var _a; return ((_a = config.exercises[e.exerciseId]) === null || _a === void 0 ? void 0 : _a.kind) === 'compound'; });
}
/** 写入热身状态（返回新对象，不触碰 completedAt / exercises） */
function withWarmup(session, warmup) {
    return Object.assign(Object.assign({}, session), { warmup: Object.assign({}, warmup) });
}
/** 连练日期：只认 completedAt */
function completedTrainDates(sessions) {
    return Object.keys(sessions)
        .filter((d) => sessions[d] && !!sessions[d].completedAt)
        .sort();
}

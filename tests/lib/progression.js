"use strict";
/**
 * IT2-01 渐进超负荷建议（纯函数，无 wx 依赖）
 * 单测：tests/progression.test.js（逻辑与本文件保持同步）
 *
 * 判定口径：
 *  - 达标组 hit：done && reps >= repMax
 *  - 未完成组 miss：!done || reps < repMin
 *  - 复合：全部组 hit → 加重一档；有 miss → 维持；最近连续 N(默认2) 次都有 miss → 减量
 *  - 孤立：全部组 hit → 加重一档并回到 repMin；无 miss → 次数 +1（不超 repMax）；有 miss → 维持；连续 miss → 减量
 *  - 自重（步进 0）：只加次数
 *  - 无历史 → null（不给建议）
 * 建议仅用于预填 set-logger，用户可改。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PROGRESSION = void 0;
exports.suggestNext = suggestNext;
exports.repRangeFromCards = repRangeFromCards;
exports.withCardRepRanges = withCardRepRanges;
exports.DEFAULT_PROGRESSION = {
    stepKg: { barbell: 2.5, dumbbell: 2, machine: 5, cable: 2.5, bodyweight: 0 },
    repRange: { compound: { min: 6, max: 10 }, isolation: { min: 10, max: 15 } },
    deloadPct: 0.075,
    deloadAfterMisses: 2,
    exercises: {
        barbell_bench: { kind: 'compound', equipment: 'barbell' },
        db_incline_press: { kind: 'compound', equipment: 'dumbbell' },
        dip: { kind: 'compound', equipment: 'bodyweight' },
        skull_crusher: { kind: 'isolation', equipment: 'barbell' },
        y_lateral_raise: { kind: 'isolation', equipment: 'dumbbell' },
        single_cable_pulldown: { kind: 'isolation', equipment: 'cable' },
        neutral_lat_pulldown: { kind: 'compound', equipment: 'machine' },
        single_machine_row: { kind: 'compound', equipment: 'machine' },
        flared_row: { kind: 'compound', equipment: 'machine' },
        cable_curl: { kind: 'isolation', equipment: 'cable' },
        single_rdl: { kind: 'compound', equipment: 'dumbbell' },
        bulgarian_split_squat: { kind: 'compound', equipment: 'dumbbell' },
        goblet_squat: { kind: 'compound', equipment: 'dumbbell' },
        rdl: { kind: 'compound', equipment: 'barbell' },
        back_extension: { kind: 'isolation', equipment: 'bodyweight' },
    },
};
function round2(n) {
    return Math.round(n * 100) / 100;
}
function workingWeight(sets) {
    const done = sets.filter((s) => s.done);
    const pool = done.length ? done : sets;
    return pool.reduce((m, s) => Math.max(m, s.weight || 0), 0);
}
function workingReps(sets) {
    return sets.reduce((m, s) => Math.min(m, s.reps || 0), Infinity);
}
function hasMiss(sets, min) {
    return sets.some((s) => !s.done || s.reps < min);
}
function allHit(sets, max) {
    return sets.length > 0 && sets.every((s) => !!s.done && s.reps >= max);
}
/**
 * @param history 该动作在已完成训练中的组记录，最近一次在前
 */
function suggestNext(exerciseId, history, config = exports.DEFAULT_PROGRESSION) {
    const sessions = history.filter((s) => s && s.length > 0);
    if (sessions.length === 0)
        return null;
    const rule = config.exercises[exerciseId] || { kind: 'isolation', equipment: 'machine' };
    const { min, max } = (config.exerciseRepRange && config.exerciseRepRange[exerciseId]) || config.repRange[rule.kind];
    const step = config.stepKg[rule.equipment];
    const last = sessions[0];
    const w = workingWeight(last);
    const n = config.deloadAfterMisses;
    const recent = sessions.slice(0, n);
    if (recent.length >= n && recent.every((s) => hasMiss(s, min))) {
        let nw = w * (1 - config.deloadPct);
        if (step > 0)
            nw = Math.floor(nw / step) * step;
        return {
            action: 'deload',
            weight: Math.max(0, round2(nw)),
            reps: min,
            reason: `连续 ${n} 次有组未完成，减量 ${Math.round(config.deloadPct * 1000) / 10}%`,
        };
    }
    if (hasMiss(last, min)) {
        return { action: 'maintain', weight: w, reps: Math.max(min, Math.min(max, workingReps(last))), reason: '上次有组未完成，维持' };
    }
    if (allHit(last, max)) {
        if (step > 0) {
            return {
                action: 'increase',
                weight: round2(w + step),
                reps: min,
                reason: `各组达到 ${max} 次，加 ${step}kg`,
            };
        }
        return { action: 'maintain', weight: w, reps: max, reason: '自重动作已达上限，维持或换进阶变式' };
    }
    if (rule.kind === 'isolation' || step === 0) {
        const r = Math.min(max, workingReps(last) + 1);
        return { action: 'add_reps', weight: w, reps: r, reason: '先加次数，到上限再加重' };
    }
    return { action: 'maintain', weight: w, reps: workingReps(last), reason: '未全部达到次数上限，维持' };
}
/** 动作卡配置 → 每个动作的次数区间（正式组目标区间） */
function repRangeFromCards(cards) {
    const out = {};
    const ex = (cards && cards.exercises) || {};
    Object.keys(ex).forEach((id) => {
        const d = ex[id] && ex[id].dose;
        if (d && d.repMin > 0 && d.repMax >= d.repMin)
            out[id] = { min: d.repMin, max: d.repMax };
    });
    return out;
}
function withCardRepRanges(base, cards) {
    return Object.assign(Object.assign({}, base), { exerciseRepRange: Object.assign(Object.assign({}, (base.exerciseRepRange || {})), repRangeFromCards(cards)) });
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PICK_NOTE = exports.DOSE_LABEL = exports.DOSE_NOTE = exports.DEFAULT_RAMP = void 0;
exports.rampSets = rampSets;
exports.firstCompound = firstCompound;
exports.withWarmup = withWarmup;
exports.completedTrainDates = completedTrainDates;
exports.contentNotes = contentNotes;
exports.rampConfigFromJson = rampConfigFromJson;
exports.buildWarmupSections = buildWarmupSections;
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
/** 全站唯一剂量说明文案（tests/doseNote.test.js 扫描防变体） */
exports.DOSE_NOTE = '剂量为通用建议，因人而异';
/** BUG-A：剂量旁标注，来源链接只挂动作本身 */
exports.DOSE_LABEL = exports.DOSE_NOTE;
exports.PICK_NOTE = '热身动作按需挑选，不必全做';
/** 配置 _meta 的剂量说明 / 挑选说明（缺省回退常量） */
function contentNotes(cfg) {
    const m = (cfg && cfg._meta) || {};
    return { doseNote: m.doseNote || exports.DOSE_NOTE, pickNote: m.pickNote || exports.PICK_NOTE };
}
/** JSON rampSets → RampConfig；未提供时用 DEFAULT_RAMP */
function rampConfigFromJson(json, base = exports.DEFAULT_RAMP) {
    const steps = json && Array.isArray(json.steps) ? json.steps : null;
    if (!steps || !steps.length)
        return base;
    return Object.assign(Object.assign({}, base), { steps: steps.map((s) => ({
            pct: typeof s.loadPct === 'number' ? s.loadPct / 100 : 0,
            reps: s.reps,
        })) });
}
function mapItems(prefix, list) {
    return (list || []).map((it, i) => ({
        id: `${prefix}_${i}`,
        text: it.name,
        dose: it.dose ? String(it.dose) : '',
        source: it.source ? { title: `参考来源 · ${it.source.title}`, url: it.source.url } : undefined,
    }));
}
/** 按日类型组装：一般热身 → 放松 → 激活（推日附肩日可选激活） */
function buildWarmupSections(cfg, dayType) {
    const sections = [];
    if (cfg.general) {
        sections.push({
            key: 'general',
            title: cfg.general.name || '一般热身',
            items: [{ id: 'general_0', text: String(cfg.general.detail || cfg.general.name), dose: cfg.general.dose ? String(cfg.general.dose) : '' }],
        });
    }
    const day = (cfg.days && cfg.days[dayType]) || {};
    if (day.release && day.release.length) {
        sections.push({ key: 'release', title: '放松', items: mapItems(`${dayType}_rel`, day.release) });
    }
    if (day.activate && day.activate.length) {
        sections.push({ key: 'activate', title: '激活', items: mapItems(`${dayType}_act`, day.activate) });
    }
    const sh = cfg.days && cfg.days.shoulder;
    if (dayType === 'push' && sh && sh.activate && sh.activate.length) {
        sections.push({ key: 'shoulder', title: sh.label || '肩部激活（可选）', optional: true, items: mapItems('shoulder_act', sh.activate) });
    }
    return sections;
}

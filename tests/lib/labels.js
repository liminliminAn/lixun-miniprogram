"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bfBandLabel = exports.trainYearsLabel = exports.goalLabel = exports.sexLabel = exports.JOINT_LIMIT_LABEL = exports.BF_BAND_TEXT = exports.TRAIN_YEARS_LABEL = exports.GOAL_LABEL = exports.SEX_LABEL = void 0;
exports.profileLabels = profileLabels;
exports.SEX_LABEL = { male: '男', female: '女' };
exports.GOAL_LABEL = {
    recomp: '增肌减脂',
    cut: '减脂',
    bulk: '增肌',
    beginner: '入门',
};
exports.TRAIN_YEARS_LABEL = {
    lt_half: '不到半年',
    half_to_2: '半年～2年',
    gt_2: '2年以上',
};
/** 体脂区间：与问卷选项一致（按性别刻度不同） */
exports.BF_BAND_TEXT = {
    male: { very_low: '很低（<12%）', low: '较低（12–18%）', mid: '中等（18–25%）', high: '偏高（>25%）' },
    female: { very_low: '很低（<18%）', low: '较低（18–25%）', mid: '中等（25–32%）', high: '偏高（>32%）' },
};
const JOINT_LIMIT_LABEL = (v) => (v ? '有，需保守' : '无');
exports.JOINT_LIMIT_LABEL = JOINT_LIMIT_LABEL;
function pick(map, k) {
    return typeof k === 'string' && Object.prototype.hasOwnProperty.call(map, k) ? map[k] : '—';
}
const sexLabel = (v) => pick(exports.SEX_LABEL, v);
exports.sexLabel = sexLabel;
const goalLabel = (v) => pick(exports.GOAL_LABEL, v);
exports.goalLabel = goalLabel;
const trainYearsLabel = (v) => pick(exports.TRAIN_YEARS_LABEL, v);
exports.trainYearsLabel = trainYearsLabel;
const bfBandLabel = (sex, band) => pick(exports.BF_BAND_TEXT[sex === 'female' ? 'female' : 'male'], band);
exports.bfBandLabel = bfBandLabel;
/** 档案展示行（我的页用），全部为中文 */
function profileLabels(p) {
    if (!p)
        return {};
    return {
        sex: (0, exports.sexLabel)(p.sex),
        bfBand: (0, exports.bfBandLabel)(p.sex, p.bfBand),
        goal: (0, exports.goalLabel)(p.goal),
        trainYears: (0, exports.trainYearsLabel)(p.trainYears),
        jointLimit: (0, exports.JOINT_LIMIT_LABEL)(p.jointLimit),
    };
}

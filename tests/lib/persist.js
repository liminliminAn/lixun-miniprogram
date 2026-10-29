"use strict";
/** 存储写入前的纯函数规则（便于单测） */
Object.defineProperty(exports, "__esModule", { value: true });
exports.keepCreatedAt = keepCreatedAt;
exports.mergeLastSets = mergeLastSets;
/** 重做问卷保留原档案的 createdAt，首次使用日不会后移；无合法旧值则用 now */
function keepCreatedAt(prev, now) {
    return prev && typeof prev.createdAt === 'string' && !isNaN(new Date(prev.createdAt).getTime()) ? prev.createdAt : now;
}
/** lastSets 只从 done=true 的组更新：取每个动作最后一个已勾选组；没有勾选组则保留原值 */
function mergeLastSets(lastSets, exercises) {
    const out = Object.assign({}, lastSets);
    exercises.forEach((ex) => {
        const done = (ex.sets || []).filter((x) => x && x.done === true);
        if (done.length)
            out[ex.exerciseId] = Object.assign({}, done[done.length - 1]);
    });
    return out;
}

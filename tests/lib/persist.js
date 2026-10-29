"use strict";
/** 存储写入前的纯函数规则（便于单测） */
Object.defineProperty(exports, "__esModule", { value: true });
exports.keepCreatedAt = keepCreatedAt;
/** 重做问卷保留原档案的 createdAt，首次使用日不会后移；无合法旧值则用 now */
function keepCreatedAt(prev, now) {
    return prev && typeof prev.createdAt === 'string' && !isNaN(new Date(prev.createdAt).getTime()) ? prev.createdAt : now;
}

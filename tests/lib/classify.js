"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classify = classify;
/**
 * 人群分类纯函数（可单测）
 * 规则顺序：
 * 1. jointLimit 或 trainYears=='lt_half' 或 goal=='beginner' → beginner
 * 2. goal=='cut' → cut
 * 3. goal=='bulk' → bfBand in (very_low, low) ? bulk : recomp
 * 4. goal=='recomp' → recomp
 * 5. else → recomp
 */
function classify(p) {
    if (p.jointLimit || p.trainYears === 'lt_half' || p.goal === 'beginner') {
        return 'beginner';
    }
    if (p.goal === 'cut') {
        return 'cut';
    }
    if (p.goal === 'bulk') {
        return p.bfBand === 'very_low' || p.bfBand === 'low' ? 'bulk' : 'recomp';
    }
    if (p.goal === 'recomp') {
        return 'recomp';
    }
    return 'recomp';
}

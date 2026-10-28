"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOCAL_ONLY_COPY = exports.KEY_PREFIX = exports.DEFAULT_AVATAR = exports.DEFAULT_NICKNAME = exports.NICKNAME_MAX = exports.USER_VERSION = void 0;
exports.validateNickname = validateNickname;
exports.buildUser = buildUser;
exports.isValidUser = isValidUser;
exports.decideRoute = decideRoute;
exports.afterLoginUrl = afterLoginUrl;
exports.keysToClear = keysToClear;
exports.isSavedAvatar = isSavedAvatar;
/**
 * IT2-07 本地登录（纯函数，不接后端、不调 wx.login）。单测：tests/login.test.js
 */
exports.USER_VERSION = 1;
exports.NICKNAME_MAX = 20;
exports.DEFAULT_NICKNAME = '力训用户';
exports.DEFAULT_AVATAR = '/assets/default-avatar.png';
exports.KEY_PREFIX = 'lixun:v1:';
exports.LOCAL_ONLY_COPY = '资料只保存在本机，换手机或删除小程序后会丢失';
/** 去首尾空格，按字符（含 emoji）计 1–20 */
function validateNickname(raw) {
    const value = typeof raw === 'string' ? raw.trim() : '';
    const len = Array.from(value).length;
    if (len < 1)
        return { ok: false, error: '请填写昵称' };
    if (len > exports.NICKNAME_MAX)
        return { ok: false, error: `昵称最多 ${exports.NICKNAME_MAX} 个字` };
    return { ok: true, value };
}
function buildUser(input) {
    const guest = !!input.guest;
    const v = validateNickname(input.nickname);
    return {
        nickname: guest || !v.ok ? exports.DEFAULT_NICKNAME : v.value,
        avatarPath: input.avatarPath || exports.DEFAULT_AVATAR,
        agreedAt: (input.now || new Date()).toISOString(),
        version: exports.USER_VERSION,
        guest,
        openid: null,
    };
}
function isValidUser(u) {
    return !!u && typeof u === 'object' && typeof u.nickname === 'string' && !!u.agreedAt;
}
/** 启动/进 Tab 时的路由判定：无 user → 登录；无画像 → 问卷；否则留在当前 Tab */
function decideRoute(user, onboardingDone) {
    if (!isValidUser(user))
        return 'login';
    return onboardingDone ? 'ok' : 'onboarding';
}
/** 登录完成后的去向 */
function afterLoginUrl(onboardingDone) {
    return onboardingDone ? '/pages/today/today' : '/pages/onboarding/onboarding';
}
/** 退出时要清的 key：本小程序 lixun:v1:* 全部 */
function keysToClear(allKeys) {
    return allKeys.filter((k) => typeof k === 'string' && k.indexOf(exports.KEY_PREFIX) === 0);
}
/** 只删 saveFile 产生的本地文件，不删包内默认头像 */
function isSavedAvatar(path) {
    return !!path && path !== exports.DEFAULT_AVATAR && path.indexOf('/assets/') !== 0;
}

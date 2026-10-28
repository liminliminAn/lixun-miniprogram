/**
 * IT2-07 本地登录（纯函数，不接后端、不调 wx.login）。单测：tests/login.test.js
 */
export const USER_VERSION = 1;
export const NICKNAME_MAX = 20;
export const DEFAULT_NICKNAME = '力训用户';
export const DEFAULT_AVATAR = '/assets/default-avatar.png';
export const KEY_PREFIX = 'lixun:v1:';
export const LOCAL_ONLY_COPY = '资料只保存在本机，换手机或删除小程序后会丢失';

export type NicknameResult = { ok: true; value: string } | { ok: false; error: string };

/** 去首尾空格，按字符（含 emoji）计 1–20 */
export function validateNickname(raw: unknown): NicknameResult {
  const value = typeof raw === 'string' ? raw.trim() : '';
  const len = Array.from(value).length;
  if (len < 1) return { ok: false, error: '请填写昵称' };
  if (len > NICKNAME_MAX) return { ok: false, error: `昵称最多 ${NICKNAME_MAX} 个字` };
  return { ok: true, value };
}

/** guest 未勾选协议时 agreedAt=null（BUG-C）；agreed 缺省：非 guest 视为已勾选（登录按钮已校验勾选） */
export function buildUser(input: { nickname?: string; avatarPath?: string; guest?: boolean; agreed?: boolean; now?: Date }): LocalUser {
  const guest = !!input.guest;
  const v = validateNickname(input.nickname);
  return {
    nickname: guest || !v.ok ? DEFAULT_NICKNAME : v.value,
    avatarPath: input.avatarPath || DEFAULT_AVATAR,
    agreedAt: (input.agreed !== undefined ? input.agreed : !guest) ? (input.now || new Date()).toISOString() : null,
    version: USER_VERSION,
    guest,
    openid: null,
  };
}

export function isValidUser(u: unknown): u is LocalUser {
  return !!u && typeof u === 'object' && typeof (u as LocalUser).nickname === 'string' &&
    (!!(u as LocalUser).agreedAt || (u as LocalUser).guest === true);
}

export type EntryRoute = 'login' | 'onboarding' | 'ok';

/** 启动/进 Tab 时的路由判定：无 user → 登录；无画像 → 问卷；否则留在当前 Tab */
export function decideRoute(user: unknown, onboardingDone: boolean): EntryRoute {
  if (!isValidUser(user)) return 'login';
  return onboardingDone ? 'ok' : 'onboarding';
}

/** BUG-D：app.onLaunch 首帧前判定，需跳转时返回 reLaunch 目标，否则 null（今日直接渲染） */
export function launchRedirect(user: unknown, onboardingDone: boolean): string | null {
  const r = decideRoute(user, onboardingDone);
  if (r === 'login') return '/pages/login/login';
  if (r === 'onboarding') return '/pages/onboarding/onboarding';
  return null;
}

/** 登录完成后的去向 */
export function afterLoginUrl(onboardingDone: boolean): string {
  return onboardingDone ? '/pages/today/today' : '/pages/onboarding/onboarding';
}

/** 退出时要清的 key：本小程序 lixun:v1:* 全部 */
export function keysToClear(allKeys: string[]): string[] {
  return allKeys.filter((k) => typeof k === 'string' && k.indexOf(KEY_PREFIX) === 0);
}

/** 只删 saveFile 产生的本地文件，不删包内默认头像 */
export function isSavedAvatar(path: string | undefined | null): boolean {
  return !!path && path !== DEFAULT_AVATAR && path.indexOf('/assets/') !== 0;
}

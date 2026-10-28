import { KEYS, get, set, remove } from './storage';
import { isOnboardingDone } from './profile';
import { decideRoute, keysToClear, isSavedAvatar } from '../utils/login';

export function getUser(): LocalUser | null {
  return get<LocalUser | null>(KEYS.user, null);
}

export function saveUser(u: LocalUser): void {
  set(KEYS.user, u);
}

/** Tab 页 onShow 调用：未登录 → 登录页；未问卷 → 问卷；返回 true 表示可继续渲染 */
export function guardEntry(): boolean {
  const r = decideRoute(getUser(), isOnboardingDone());
  if (r === 'login') {
    wx.reLaunch({ url: '/pages/login/login' });
    return false;
  }
  if (r === 'onboarding') {
    wx.redirectTo({ url: '/pages/onboarding/onboarding' });
    return false;
  }
  return true;
}

/** 头像临时文件持久化，返回本地路径；失败回退临时路径（为空则调用方用默认头像） */
export function persistAvatar(tempPath: string, prev?: string): Promise<string> {
  return new Promise((resolve) => {
    wx.getFileSystemManager().saveFile({
      tempFilePath: tempPath,
      success: (r) => {
        if (prev && isSavedAvatar(prev)) removeAvatarFile(prev);
        resolve(r.savedFilePath);
      },
      fail: () => resolve(''),
    });
  });
}

export function removeAvatarFile(path: string): void {
  if (!isSavedAvatar(path)) return;
  try {
    wx.getFileSystemManager().removeSavedFile({ filePath: path, fail: () => {} });
  } catch {
    /* ignore */
  }
}

/** 退出并清除：删头像文件 + 所有 lixun:v1:* key */
export function clearAllLocalData(): void {
  const u = getUser();
  if (u) removeAvatarFile(u.avatarPath);
  let keys: string[] = [];
  try {
    keys = wx.getStorageInfoSync().keys;
  } catch {
    keys = [];
  }
  const all = keysToClear(keys.concat(Object.values(KEYS)));
  Array.from(new Set(all)).forEach((k) => remove(k));
}

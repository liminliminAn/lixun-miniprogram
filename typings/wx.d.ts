/** Minimal WeChat miniprogram typings for local TS check */
declare const wx: {
  setStorageSync(key: string, data: unknown): void;
  getStorageSync(key: string): unknown;
  removeStorageSync(key: string): void;
  clearStorageSync(): void;
  getSystemInfoSync(): { pixelRatio: number; theme?: 'light' | 'dark'; [k: string]: any };
  setClipboardData(opts: { data: string; success?: () => void }): void;
  showToast(opts: { title: string; icon?: string; duration?: number }): void;
  showActionSheet(opts: { itemList: string[]; itemColor?: string; success?: (res: { tapIndex: number }) => void; fail?: (err: unknown) => void }): void;
  showModal(opts: {
    title: string;
    content: string;
    showCancel?: boolean;
    success?: (res: { confirm: boolean; cancel: boolean }) => void;
  }): void;
  navigateTo(opts: { url: string }): void;
  switchTab(opts: { url: string }): void;
  redirectTo(opts: { url: string }): void;
  reLaunch(opts: { url: string }): void;
  navigateBack(opts?: { delta?: number }): void;
  setNavigationBarTitle(opts: { title: string }): void;
  getStorageInfoSync(): { keys: string[]; [k: string]: any };
  getFileSystemManager(): {
    saveFile(opts: { tempFilePath: string; success?: (r: { savedFilePath: string }) => void; fail?: (e: any) => void }): void;
    removeSavedFile(opts: { filePath: string; success?: () => void; fail?: (e: any) => void }): void;
  };
  openPrivacyContract?: (opts?: { success?: () => void; fail?: (e: any) => void }) => void;
  onNeedPrivacyAuthorization?: (cb: (resolve: (r: { event: 'agree' | 'disagree'; buttonId?: string }) => void, ev: { referrer: string }) => void) => void;
};

declare function App<T>(options: T): void;
declare function Page<T>(options: T): void;
declare function Component<T>(options: T): void;
declare function getApp<T>(): T;
declare function getCurrentPages(): unknown[];

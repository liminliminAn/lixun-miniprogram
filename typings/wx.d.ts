/** Minimal WeChat miniprogram typings for local TS check */
declare const wx: {
  setStorageSync(key: string, data: unknown): void;
  getStorageSync(key: string): unknown;
  removeStorageSync(key: string): void;
  clearStorageSync(): void;
  showToast(opts: { title: string; icon?: string; duration?: number }): void;
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
};

declare function App<T>(options: T): void;
declare function Page<T>(options: T): void;
declare function Component<T>(options: T): void;
declare function getApp<T>(): T;
declare function getCurrentPages(): unknown[];

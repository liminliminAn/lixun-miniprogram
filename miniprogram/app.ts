import { storage } from './services/storage';

App<IAppOption>({
  globalData: {
    version: '0.1.0',
  },
  onLaunch() {
    storage.ensureDefaults();
  },
});

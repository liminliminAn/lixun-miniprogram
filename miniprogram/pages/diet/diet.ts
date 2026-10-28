import { guardEntry } from '../../services/user';
import { CROWDS } from '../../constants/crowds';
import { getProfile } from '../../services/profile';
import { listBodyWeights } from '../../services/body';
import { todayDayType } from '../../services/workout';
import { getDietLog, setProteinHit } from '../../services/diet';
import { calcMacros, DIET_DISCLAIMER, dietDisclaimer } from '../../utils/diet';
import { formatDate } from '../../utils/date';

Page({
  data: {
    crowd: null as any,
    target: null as any,
    bodyweightKg: 0,
    isRestDay: false,
    proteinHit: false,
    disclaimer: DIET_DISCLAIMER,
  },
  onShow() {
    if (!guardEntry()) return;
    this.refresh();
  },
  /** 每次进入页面重算：体重变化后同步更新 */
  refresh() {
    const profile = getProfile();
    if (!profile) return;
    const latest = listBodyWeights()[0];
    const bodyweightKg = latest ? latest.kg : profile.weightKg;
    const isRestDay = todayDayType() === 'rest';
    const today = getDietLog()[formatDate()];
    this.setData({
      crowd: CROWDS[profile.crowd],
      bodyweightKg,
      isRestDay,
      disclaimer: dietDisclaimer(profile.crowd),
      target: calcMacros(profile.crowd, bodyweightKg, isRestDay),
      proteinHit: !!(today && today.proteinHit),
    });
  },
  onToggleProtein() {
    const hit = !this.data.proteinHit;
    setProteinHit(hit);
    this.setData({ proteinHit: hit });
  },
});

import { DAY_TYPE_LABEL } from '../../constants/templates';
import { EXERCISE_MAP } from '../../constants/exercises';
import { startOrResumeSession, saveSession } from '../../services/workout';
import { DEFAULT_PROGRESSION } from '../../utils/progression';
import { rampSets, firstCompound, withWarmup, RampConfig } from '../../utils/warmup';
import { formatDate } from '../../utils/date';

// 本地 JSON 配置（占位内容）
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CONFIG: any = require('../../config/warmup.json');

const SECTION_TITLES: Record<string, string> = {
  general: '一般热身',
  dynamic: '动态拉伸',
  activation: '专项激活',
};

Page({
  data: {
    dayLabel: '',
    sections: [] as { key: string; title: string; items: { id: string; text: string; checked: boolean }[] }[],
    ramp: [] as { id: string; text: string; checked: boolean }[],
    rampName: '',
    elapsedSec: 0,
    timeText: '00:00',
    running: false,
  },
  session: null as SessionRecord | null,
  rampRaw: [] as WarmupRampSet[],
  rampExerciseId: '',
  timer: 0 as any,
  onLoad() {
    const session = startOrResumeSession(formatDate());
    if (!session) {
      wx.redirectTo({ url: '/pages/session/session' });
      return;
    }
    this.session = session;
    const day = CONFIG.days[session.dayType] || {};
    const checked = new Set<string>(session.warmup ? session.warmup.checked : []);
    const sections = ['general', 'dynamic', 'activation'].map((key) => ({
      key,
      title: SECTION_TITLES[key],
      items: (day[key] || []).map((it: { id: string; text: string }) => ({ ...it, checked: checked.has(it.id) })),
    }));
    const fc = firstCompound(session.exercises);
    let ramp: { id: string; text: string; checked: boolean }[] = [];
    let rampName = '';
    if (fc) {
      const planned = fc.sets.length ? fc.sets[0].weight : 0;
      const isBarbell = DEFAULT_PROGRESSION.exercises[fc.exerciseId]?.equipment === 'barbell';
      this.rampRaw = rampSets(planned, CONFIG.ramp as RampConfig, isBarbell);
      this.rampExerciseId = fc.exerciseId;
      rampName = (EXERCISE_MAP[fc.exerciseId] && EXERCISE_MAP[fc.exerciseId].name) || fc.exerciseId;
      ramp = this.rampRaw.map((r, i) => ({
        id: `ramp_${i}`,
        text: `${r.pct === 0 ? (isBarbell ? '空杆' : '空载') : Math.round(r.pct * 100) + '%'} · ${r.weight}kg × ${r.reps}`,
        checked: checked.has(`ramp_${i}`),
      }));
    }
    this.setData({ dayLabel: DAY_TYPE_LABEL[session.dayType], sections, ramp, rampName });
  },
  onUnload() {
    clearInterval(this.timer);
  },
  onToggleTimer() {
    if (this.data.running) {
      clearInterval(this.timer);
      this.setData({ running: false });
      return;
    }
    this.timer = setInterval(() => {
      const s = this.data.elapsedSec + 1;
      const mm = String(Math.floor(s / 60)).padStart(2, '0');
      const ss = String(s % 60).padStart(2, '0');
      this.setData({ elapsedSec: s, timeText: `${mm}:${ss}` });
    }, 1000);
    this.setData({ running: true });
  },
  onToggleItem(e: any) {
    const { sec, idx } = e.currentTarget.dataset;
    if (sec === 'ramp') {
      this.setData({ [`ramp[${idx}].checked`]: !this.data.ramp[idx].checked });
    } else {
      const si = this.data.sections.findIndex((s) => s.key === sec);
      const cur = this.data.sections[si].items[idx].checked;
      this.setData({ [`sections[${si}].items[${idx}].checked`]: !cur });
    }
  },
  collectChecked(): string[] {
    const ids: string[] = [];
    this.data.sections.forEach((s) => s.items.forEach((it) => it.checked && ids.push(it.id)));
    this.data.ramp.forEach((it) => it.checked && ids.push(it.id));
    return ids;
  },
  finish(status: WarmupRecord['status']) {
    clearInterval(this.timer);
    if (this.session) {
      const total = this.data.sections.reduce((n, s) => n + s.items.length, 0) + this.data.ramp.length;
      const checked = status === 'skipped' ? [] : this.collectChecked();
      const st = status === 'skipped' ? 'skipped' : checked.length >= total ? 'done' : 'partial';
      saveSession(
        withWarmup(this.session, {
          status: st,
          checked,
          ramp: this.rampRaw,
          rampExerciseId: this.rampExerciseId || undefined,
          elapsedSec: this.data.elapsedSec,
          at: new Date().toISOString(),
        }),
      );
    }
    wx.redirectTo({ url: '/pages/session/session' });
  },
  onSkip() {
    this.finish('skipped');
  },
  onDone() {
    this.finish('done');
  },
});

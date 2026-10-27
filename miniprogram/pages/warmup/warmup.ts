import { DAY_TYPE_LABEL } from '../../constants/templates';
import { EXERCISE_MAP } from '../../constants/exercises';
import { startOrResumeSession, saveSession } from '../../services/workout';
import { DEFAULT_PROGRESSION } from '../../utils/progression';
import { rampSets, firstCompound, withWarmup, buildWarmupSections, rampConfigFromJson, DOSE_PLACEHOLDER, WarmupViewItem } from '../../utils/warmup';
import { formatDate } from '../../utils/date';

// 本地 JSON 配置（占位内容）
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CONFIG: any = require('../../config/warmup.json');

Page({
  data: {
    dayLabel: '',
    sections: [] as { key: string; title: string; optional?: boolean; items: (WarmupViewItem & { checked: boolean })[] }[],
    ramp: [] as { id: string; text: string; checked: boolean }[],
    daySource: null as { title: string; url: string } | null,
    doseText: DOSE_PLACEHOLDER,
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
    const checked = new Set<string>(session.warmup ? session.warmup.checked : []);
    const sections = buildWarmupSections(CONFIG, session.dayType).map((sec) => ({
      ...sec,
      items: sec.items.map((it) => ({ ...it, checked: checked.has(it.id) })),
    }));
    const day = CONFIG.days && CONFIG.days[session.dayType];
    const daySource = day && day.source ? { title: day.source.title, url: day.source.url } : null;
    const fc = firstCompound(session.exercises);
    let ramp: { id: string; text: string; checked: boolean }[] = [];
    let rampName = '';
    if (fc) {
      const planned = fc.sets.length ? fc.sets[0].weight : 0;
      const isBarbell = DEFAULT_PROGRESSION.exercises[fc.exerciseId]?.equipment === 'barbell';
      this.rampRaw = rampSets(planned, rampConfigFromJson(CONFIG.rampSets), isBarbell);
      this.rampExerciseId = fc.exerciseId;
      rampName = (EXERCISE_MAP[fc.exerciseId] && EXERCISE_MAP[fc.exerciseId].name) || fc.exerciseId;
      ramp = this.rampRaw.map((r, i) => ({
        id: `ramp_${i}`,
        text: `${r.pct === 0 ? (isBarbell ? '空杆' : '空载') : Math.round(r.pct * 100) + '%'} · ${r.weight}kg × ${r.reps}`,
        checked: checked.has(`ramp_${i}`),
      }));
    }
    this.setData({ dayLabel: DAY_TYPE_LABEL[session.dayType], sections, ramp, rampName, daySource });
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
  onCopyLink(e: any) {
    wx.setClipboardData({ data: e.currentTarget.dataset.url });
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
      const total = this.data.sections.filter((s) => !s.optional).reduce((n, s) => n + s.items.length, 0) + this.data.ramp.length;
      const checked = status === 'skipped' ? [] : this.collectChecked();
      const st = status === 'skipped' ? 'skipped' : this.collectChecked().filter((id) => !id.startsWith('shoulder_')).length >= total ? 'done' : 'partial';
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

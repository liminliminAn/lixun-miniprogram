import { DAY_TYPE_LABEL } from '../../constants/templates';
import { EXERCISE_MAP } from '../../constants/exercises';
import { startOrResumeSession, saveSession } from '../../services/workout';
import { DEFAULT_PROGRESSION } from '../../utils/progression';
import { rampSets, firstCompound, withWarmup, withLiveChecked, buildWarmupSections, rampConfigFromJson, contentNotes, DOSE_LABEL, videoLine, VIDEO_TOAST, WarmupViewItem, figureUrl, WARMUP_FIGURE_PAGE } from '../../utils/warmup';
import { formatDate } from '../../utils/date';
import { shoulderWarmupAddon, COPY_TOAST } from '../../utils/posture';

// 本地内容配置 it2-v2
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CONFIG: any = require('../../config/warmup.js');
const POSTURE: any = require('../../config/posture.js');

Page({
  data: {
    dayLabel: '',
    sections: [] as { key: string; title: string; optional?: boolean; frequency?: string; items: (WarmupViewItem & { checked: boolean })[] }[],
    ramp: [] as { id: string; text: string; checked: boolean }[],
    daySource: null as { title: string; url: string } | null,
    dayVideo: null as any,
    doseNote: contentNotes(CONFIG).doseNote,
    pickNote: contentNotes(CONFIG).pickNote,
    doseLabel: DOSE_LABEL,
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
    const base = buildWarmupSections(CONFIG, session.dayType);
    const addon = shoulderWarmupAddon(POSTURE, session.dayType);
    if (addon) {
      const ai = base.findIndex((x) => x.key === 'activate');
      base.splice(ai >= 0 ? ai + 1 : base.length, 0, addon);
    }
    const sections = base.map((sec) => ({
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
    this.setData({
      dayVideo: day ? videoLine(day.video) : null, dayLabel: DAY_TYPE_LABEL[session.dayType], sections, ramp, rampName, daySource });
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
    this.persistChecked();
  },
  /** §3.4-12：勾选第一个热身项立即落盘 → 今天立即锁定；全部取消则解锁（§3.4-11） */
  persistChecked() {
    if (!this.session) return;
    this.session = withLiveChecked(this.session, this.collectChecked());
    saveSession(this.session);
  },
  /** 视频：复制「<url> <time>」，不内嵌 */
  onCopyVideo(e: any) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.copy,
      success: () => wx.showToast({ title: VIDEO_TOAST, icon: 'none' }),
    });
  },
  /** 分包图解页（主包不渲染分包图片） */
  onOpenFigure(e: any) {
    const d = e.currentTarget.dataset;
    if (d.img) wx.navigateTo({ url: figureUrl(WARMUP_FIGURE_PAGE, d.img, d.title, d.cue) });
  },
  onCopyLink(e: any) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.url,
      success: () => wx.showToast({ title: COPY_TOAST, icon: 'none' }),
    });
  },
  /** 只统计必做项（可选段不影响完成判定） */
  requiredChecked(): number {
    let n = 0;
    this.data.sections.forEach((s) => !s.optional && s.items.forEach((it) => it.checked && n++));
    this.data.ramp.forEach((it) => it.checked && n++);
    return n;
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
      const st = status === 'skipped' ? 'skipped' : this.requiredChecked() >= total ? 'done' : 'partial';
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

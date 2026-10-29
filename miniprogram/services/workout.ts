import { storage, KEYS } from './storage';
import { mergeLastSets } from '../utils/persist';
import { exercisesByDay } from '../constants/exercises';
import { getPlan, getEffectiveWeek } from './profile';
import { suggestNext, withCardRepRanges, DEFAULT_PROGRESSION } from '../utils/progression';

// IT2-04：次数区间以动作卡正式组剂量为准
const CARDS: any = require('../config/exercise-cards.js');
const PROGRESSION = withCardRepRanges(DEFAULT_PROGRESSION, CARDS);
import { completedTrainDates } from '../utils/warmup';
import { restoreDecision, pinnedTodayType, isTrained } from '../utils/schedule';
import { formatDate, mondayBasedIndex, countConsecutiveTrainDays } from '../utils/date';

export function todayDayType(date: Date = new Date()): DayType {
  const plan = getPlan();
  if (!plan) return 'rest';
  // §3.4-8：当天已有记录 → 固定为记录的类型（新课表从明天起生效）
  return pinnedTodayType(getEffectiveWeek(), mondayBasedIndex(date), getSession(formatDate(date)));
}

export function getSessions(): SessionsStore {
  return storage.get<SessionsStore>(KEYS.sessions, {});
}

export function getSession(date: string): SessionRecord | undefined {
  return getSessions()[date];
}

export function getLastSets(): LastSetsStore {
  return storage.get<LastSetsStore>(KEYS.lastSets, {});
}

export function getLastSetFor(exerciseId: string): SetRecord | undefined {
  return getLastSets()[exerciseId];
}

/** 某动作在已完成训练中的组记录，最近在前 */
export function exerciseHistory(exerciseId: string): SetRecord[][] {
  const sessions = getSessions();
  return Object.keys(sessions)
    .filter((d) => isTrained(sessions[d] as any))
    .sort()
    .reverse()
    .map((d) => sessions[d].exercises.find((e) => e.exerciseId === exerciseId))
    .filter((e): e is ExerciseLog => !!e && e.sets.length > 0)
    .map((e) => e.sets);
}

/** 开练：若无当日 session 则按课表生成空组草稿 */
export function startOrResumeSession(
  date: string = formatDate(),
): SessionRecord | null {
  const dayType = todayDayType(new Date(date.replace(/-/g, '/') + ' 12:00:00'));
  if (dayType === 'rest') return null;

  const existing = getSession(date);
  const decision = restoreDecision(existing, dayType);
  // 只恢复与今天生效类型一致的未完成记录；已完成的原样返回；类型不符则按新类型重开
  if (existing && decision !== 'fresh') return existing;

  const lastSets = getLastSets();
  const exercises = exercisesByDay(dayType).map((ex) => {
    const last = lastSets[ex.id];
    // IT2-01：有已完成历史则按渐进超负荷规则预填（可改）；否则沿用上次/默认
    const sug = suggestNext(ex.id, exerciseHistory(ex.id), PROGRESSION);
    const seed = {
      reps: sug ? sug.reps : last?.reps ?? 8,
      weight: sug ? sug.weight : last?.weight ?? 0,
      done: false,
    };
    return {
      exerciseId: ex.id,
      // 默认 4 组草稿，重量/次数预填上次；完成态由记组勾选
      sets: [
        { ...seed },
        { ...seed },
        { ...seed },
        { ...seed },
      ],
    };
  });

  const session: SessionRecord = {
    date,
    dayType,
    exercises,
  };
  const all = getSessions();
  all[date] = session;
  storage.set(KEYS.sessions, all);
  return session;
}

export function saveSession(session: SessionRecord): void {
  const all = getSessions();
  all[session.date] = session;
  storage.set(KEYS.sessions, all);

  // 更新 lastSets：只取每个动作最后一个 done=true 的组；未勾选的草稿组不覆盖
  storage.set(KEYS.lastSets, mergeLastSets(getLastSets(), session.exercises));
}

export function completeSession(date: string = formatDate()): void {
  const session = getSession(date);
  if (!session) return;
  session.completedAt = new Date().toISOString();
  saveSession(session);
}

/** 仅已完成训练日计入连练（需 completedAt；草稿开练不算） */
export function listTrainDates(): string[] {
  return completedTrainDates(getSessions());
}

export function consecutiveTrainDays(today: string = formatDate()): number {
  return countConsecutiveTrainDays(new Set(listTrainDates()), today);
}

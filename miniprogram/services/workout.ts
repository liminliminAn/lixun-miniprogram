import { storage, KEYS } from './storage';
import { exercisesByDay } from '../constants/exercises';
import { getPlan } from './profile';
import { formatDate, mondayBasedIndex, countConsecutiveTrainDays } from '../utils/date';

export function todayDayType(date: Date = new Date()): DayType {
  const plan = getPlan();
  if (!plan) return 'rest';
  return plan.week[mondayBasedIndex(date)];
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

/** 开练：若无当日 session 则按课表生成空组草稿 */
export function startOrResumeSession(
  date: string = formatDate(),
): SessionRecord | null {
  const dayType = todayDayType(new Date(date.replace(/-/g, '/') + ' 12:00:00'));
  if (dayType === 'rest') return null;

  const existing = getSession(date);
  if (existing) return existing;

  const lastSets = getLastSets();
  const exercises = exercisesByDay(dayType).map((ex) => {
    const last = lastSets[ex.id];
    const seed = {
      reps: last?.reps ?? 8,
      weight: last?.weight ?? 0,
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

  // 更新 lastSets：取每个动作最后一组
  const lastSets = getLastSets();
  session.exercises.forEach((ex) => {
    if (ex.sets.length > 0) {
      lastSets[ex.exerciseId] = { ...ex.sets[ex.sets.length - 1] };
    }
  });
  storage.set(KEYS.lastSets, lastSets);
}

export function completeSession(date: string = formatDate()): void {
  const session = getSession(date);
  if (!session) return;
  session.completedAt = new Date().toISOString();
  saveSession(session);
}

/** 仅已完成训练日计入连练（需 completedAt；草稿开练不算） */
export function listTrainDates(): string[] {
  const sessions = getSessions();
  return Object.keys(sessions)
    .filter((d) => sessions[d] && !!sessions[d].completedAt)
    .sort();
}

export function consecutiveTrainDays(today: string = formatDate()): number {
  return countConsecutiveTrainDays(new Set(listTrainDates()), today);
}

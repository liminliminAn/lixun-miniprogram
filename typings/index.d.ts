/// <reference path="./wx.d.ts" />

interface IAppOption {
  globalData: {
    version: string;
    privacyResolve?: (r: { event: 'agree' | 'disagree'; buttonId?: string }) => void;
    onPrivacyNeeded?: () => void;
  };
}

type CrowdId = 'recomp' | 'cut' | 'bulk' | 'beginner';
type DaysPerWeek = 3 | 4 | 5;
type DayType = 'push' | 'pull' | 'legs' | 'rest';
type Sex = 'male' | 'female';
type BfBand = 'very_low' | 'low' | 'mid' | 'high';
type Goal = 'recomp' | 'cut' | 'bulk' | 'beginner';
type TrainYears = 'lt_half' | 'half_to_2' | 'gt_2';

interface ClassifyInput {
  heightCm: number;
  weightKg: number;
  sex: Sex;
  bfBand: BfBand;
  goal: Goal;
  trainYears: TrainYears;
  daysPerWeek: DaysPerWeek;
  jointLimit?: boolean;
}

interface UserProfile extends ClassifyInput {
  crowd: CrowdId;
  onboardingDone: boolean;
  createdAt: string;
  updatedAt: string;
}

interface WeekPlan {
  daysPerWeek: DaysPerWeek;
  /** 长度 7，周一到周日 */
  week: DayType[];
  updatedAt: string;
}

interface SetRecord {
  reps: number;
  weight: number;
  /** 本组是否已勾选完成 */
  done?: boolean;
}

interface ExerciseLog {
  exerciseId: string;
  sets: SetRecord[];
}

interface SessionRecord {
  date: string; // YYYY-MM-DD
  dayType: Exclude<DayType, 'rest'>;
  exercises: ExerciseLog[];
  completedAt?: string;
  /** IT2-06 热身状态；不计容量、不影响连练 */
  warmup?: WarmupRecord;
}

interface WarmupRampSet {
  pct: number;
  reps: number;
  weight: number;
}

interface WarmupRecord {
  status: 'done' | 'partial' | 'skipped';
  checked: string[];
  ramp: WarmupRampSet[];
  rampExerciseId?: string;
  elapsedSec: number;
  at: string;
}

interface SessionsStore {
  [date: string]: SessionRecord;
}

interface LastSetsStore {
  [exerciseId: string]: SetRecord;
}

interface BodyWeightEntry {
  date: string;
  kg: number;
}

interface Prefs {
  restSoftWarnDays: number;
  /** IT2-06 开练前默认显示热身 */
  showWarmup?: boolean;
}

declare function require(path: string): any;
declare function setTimeout(cb: () => void, ms?: number): number;
declare function setInterval(cb: () => void, ms?: number): number;
declare function clearInterval(id?: number): void;
interface DietLogEntry {
  proteinHit: boolean;
}

interface DietLogStore {
  [date: string]: DietLogEntry;
}

/** IT2-07 本地登录 lixun:v1:user（openid 预留给云同步） */
interface LocalUser {
  nickname: string;
  avatarPath: string;
  agreedAt: string | null;
  version: number;
  guest: boolean;
  openid: string | null;
}

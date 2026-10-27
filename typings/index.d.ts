/// <reference path="./wx.d.ts" />

interface IAppOption {
  globalData: {
    version: string;
  };
}

type CrowdId = 'recomp' | 'cut' | 'bulk' | 'beginner';
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
  daysPerWeek: 4 | 5;
  jointLimit?: boolean;
}

interface UserProfile extends ClassifyInput {
  crowd: CrowdId;
  onboardingDone: boolean;
  createdAt: string;
  updatedAt: string;
}

interface WeekPlan {
  daysPerWeek: 4 | 5;
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
}

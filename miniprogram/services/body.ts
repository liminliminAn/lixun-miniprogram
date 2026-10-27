import { storage, KEYS } from './storage';
import { formatDate } from '../utils/date';

export function listBodyWeights(): BodyWeightEntry[] {
  const list = storage.get<BodyWeightEntry[]>(KEYS.bodyweight, []);
  return [...list].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function addBodyWeight(kg: number, date: string = formatDate()): void {
  const list = storage.get<BodyWeightEntry[]>(KEYS.bodyweight, []);
  const idx = list.findIndex((e) => e.date === date);
  if (idx >= 0) {
    list[idx] = { date, kg };
  } else {
    list.push({ date, kg });
  }
  storage.set(KEYS.bodyweight, list);
}

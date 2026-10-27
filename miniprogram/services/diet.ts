import { storage, KEYS } from './storage';
import { formatDate } from '../utils/date';

export function getDietLog(): DietLogStore {
  return storage.get<DietLogStore>(KEYS.dietLog, {});
}

export function setProteinHit(hit: boolean, date: string = formatDate()): void {
  const log = getDietLog();
  log[date] = { proteinHit: hit };
  storage.set(KEYS.dietLog, log);
}

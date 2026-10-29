/** 存储写入前的纯函数规则（便于单测） */

/** 重做问卷保留原档案的 createdAt，首次使用日不会后移；无合法旧值则用 now */
export function keepCreatedAt(prev: { createdAt?: string } | null | undefined, now: string): string {
  return prev && typeof prev.createdAt === 'string' && !isNaN(new Date(prev.createdAt).getTime()) ? prev.createdAt : now;
}

interface SetLike { weight?: number; reps?: number; done?: boolean }

/** lastSets 只从 done=true 的组更新：取每个动作最后一个已勾选组；没有勾选组则保留原值 */
export function mergeLastSets<T extends SetLike>(
  lastSets: Record<string, T>,
  exercises: Array<{ exerciseId: string; sets: T[] }>,
): Record<string, T> {
  const out: Record<string, T> = { ...lastSets };
  exercises.forEach((ex) => {
    const done = (ex.sets || []).filter((x) => x && x.done === true);
    if (done.length) out[ex.exerciseId] = { ...done[done.length - 1] };
  });
  return out;
}

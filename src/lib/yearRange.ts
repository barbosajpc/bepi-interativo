export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Regra:
 * - start fica entre [min, max-1]
 * - end fica entre [start+1, max]
 * - se start >= end => end = start + 1
 */
export function normalizeRange(
  start: number,
  end: number,
  min: number,
  max: number
): [number, number] {
  const safeMaxStart = max - 1;

  let s = clamp(start, min, safeMaxStart);
  let e = clamp(end, s + 1, max);

  if (s >= e) e = clamp(s + 1, s + 1, max);

  return [s, e];
}

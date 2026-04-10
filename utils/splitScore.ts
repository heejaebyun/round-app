/**
 * Split score: how evenly a question's results are divided.
 * 100 = perfect 50:50. 0 = completely one-sided.
 */
export function splitScore(pctA: number, pctB: number): number {
  const diff = Math.abs(pctA - pctB);
  return Math.max(0, 100 - diff * 2);
}

/**
 * Split grade based on score.
 * S: near 50:50, A: moderate, B: one-sided, C: archive candidate.
 */
export function splitGrade(pctA: number, pctB: number): "S" | "A" | "B" | "C" {
  const s = splitScore(pctA, pctB);
  if (s >= 88) return "S"; // 44:56 ~ 56:44
  if (s >= 60) return "A"; // 30:70 ~ 70:30
  if (s >= 40) return "B"; // 20:80 ~ 80:20
  return "C";
}

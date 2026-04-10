/**
 * Question scoring helpers — small, deterministic, testable.
 * Used by snapshotUpdater to compute heat/longevity/reasonCtr.
 */

/** Normalize a raw count to 0–100 based on an expected max */
export function normalizeScore(value: number, expectedMax: number): number {
  if (expectedMax <= 0) return 0;
  return Math.min(100, Math.round((value / expectedMax) * 100));
}

/**
 * reasonCtr = reason_engaged / result_viewed
 * Measures active reason engagement, not passive exposure.
 */
export function computeReasonCtr(reasonEngaged: number, resultViewed: number): number {
  if (resultViewed <= 0) return 0;
  return Math.round((reasonEngaged / resultViewed) * 100);
}

/**
 * heatScore — how hot a question is recently.
 * Based on recent vote volume + reason engagement + reply activity.
 *
 * All inputs should be counts from a recent window (e.g. last 7 days).
 * If only all-time data is available, pass all-time as approximation.
 */
export function computeHeatScore(
  recentVotes: number,
  recentReasonEngaged: number,
  recentReplies: number,
): number {
  // Normalize against reasonable "hot" thresholds
  const voteScore = normalizeScore(recentVotes, 50);
  const reasonScore = normalizeScore(recentReasonEngaged, 20);
  const replyScore = normalizeScore(recentReplies, 10);

  return Math.round(
    voteScore * 0.4 +
    reasonScore * 0.35 +
    replyScore * 0.25,
  );
}

/**
 * longevityScore — how consistently valuable a question is over time.
 * Based on broader trailing window performance.
 *
 * All inputs should be counts from a longer window (e.g. last 30 days or all-time).
 */
export function computeLongevityScore(
  trailingVotes: number,
  trailingReasonEngaged: number,
  trailingReplies: number,
): number {
  // Normalize against reasonable "evergreen" thresholds
  const voteScore = normalizeScore(trailingVotes, 200);
  const reasonScore = normalizeScore(trailingReasonEngaged, 50);
  const replyScore = normalizeScore(trailingReplies, 30);

  return Math.round(
    voteScore * 0.35 +
    reasonScore * 0.4 +
    replyScore * 0.25,
  );
}

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
 * skipRate = question_skipped / card_viewed (as %).
 */
export function computeSkipRate(skipped: number, viewed: number): number {
  if (viewed <= 0) return 0;
  return Math.round((skipped / viewed) * 100);
}

/**
 * feedbackRate = negative feedback count / card_viewed (as %).
 * Only counts negative reasons (excludes 'liked').
 */
export function computeFeedbackRate(negativeFeedback: number, viewed: number): number {
  if (viewed <= 0) return 0;
  return Math.round((negativeFeedback / viewed) * 100);
}

/**
 * reasonEngagementRate = reason_engaged / result_viewed (as %).
 * How often people who see results also engage with reasons.
 */
export function computeReasonEngagementRate(reasonEngaged: number, resultViewed: number): number {
  if (resultViewed <= 0) return 0;
  return Math.round((reasonEngaged / resultViewed) * 100);
}

/**
 * qualityScore — composite quality heuristic (0–100).
 *
 * Positive signals (boost):
 *   - splitScore (40–60 = best → 100; <30 or >70 = weaker)
 *   - reasonEngagementRate (higher = better)
 *   - replyRate (higher = better)
 *   - heatScore / longevityScore (mild boost)
 *
 * Negative signals (penalty):
 *   - skipRate (higher = worse, weighted 2x)
 *   - feedbackRate (higher = worse, weighted 3x — stronger than skip)
 *
 * Design: readable weighted sum, easy to tune later.
 */
export function computeQualityScore(input: {
  splitScore: number;
  reasonEngagementRate: number;
  replyRate: number;
  heatScore: number;
  longevityScore: number;
  skipRate: number;
  feedbackRate: number;
}): number {
  // Split quality: best at 50 (= 100), worst at 0 or 100 (= 0)
  const splitQuality = Math.max(0, 100 - Math.abs(input.splitScore - 50) * 2);

  // Engagement signals (capped at 100 individually)
  const engagement = Math.min(100, input.reasonEngagementRate);
  const reply = Math.min(100, input.replyRate * 3); // amplify since reply is rare
  const momentum = Math.min(100, (input.heatScore + input.longevityScore) / 2);

  // Penalty signals (invert: 0 skip = 0 penalty, 50% skip = 100 penalty)
  const skipPenalty = Math.min(100, input.skipRate * 2);
  const feedbackPenalty = Math.min(100, input.feedbackRate * 3);

  const raw =
    splitQuality * 0.25 +
    engagement * 0.20 +
    reply * 0.10 +
    momentum * 0.10 -
    skipPenalty * 0.15 -
    feedbackPenalty * 0.20;

  return Math.max(0, Math.min(100, Math.round(raw)));
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

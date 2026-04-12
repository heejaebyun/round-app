import type { Question, QuestionOpsMetrics, QuestionMetricsSnapshot, QuestionStatus } from "@/lib/types";
import { splitScore, splitGrade } from "./splitScore";

/**
 * Derive operating metrics for a question from its static data.
 * Optionally merge with a runtime metrics snapshot.
 */
export function getQuestionOpsMetrics(
  question: Question,
  snapshot?: Partial<QuestionMetricsSnapshot> | null,
): QuestionOpsMetrics {
  const derivedSplit = splitScore(question.resultA, question.resultB);
  const derivedGrade = splitGrade(question.resultA, question.resultB);

  return {
    splitScore: snapshot?.splitScore ?? derivedSplit,
    splitGrade: snapshot?.splitGrade ?? derivedGrade,
    topic: question.topic ?? null,
    tension: question.tension ?? null,
    voteCount: snapshot?.voteCount,
    reasonCtr: snapshot?.reasonCtr,
    replyRate: snapshot?.replyRate,
    nextRate: snapshot?.nextRate,
    heatScore: snapshot?.heatScore,
    longevityScore: snapshot?.longevityScore,
    skipRate: snapshot?.skipRate,
    feedbackRate: snapshot?.feedbackRate,
    reasonEngagementRate: snapshot?.reasonEngagementRate,
    qualityScore: snapshot?.qualityScore,
  };
}

/** Minimum votes required before a question can be judged (low-sample guard) */
const MIN_SAMPLE_SIZE = 5;

/**
 * Derive question lifecycle status from operating metrics.
 *
 * Heuristic (v2 — now uses quality signals):
 * - test: default / not enough data (under MIN_SAMPLE_SIZE votes)
 * - archive: (weak split AND low engagement) OR high skip/feedback penalty
 * - rising: high heat AND strong engagement AND not penalized
 * - evergreen: good split AND stable engagement AND decent quality
 */
export function deriveQuestionStatus(metrics: QuestionOpsMetrics): QuestionStatus {
  const { splitScore: ss, voteCount, reasonCtr, replyRate } = metrics;
  const votes = voteCount ?? 0;

  // Low-sample guard: cold start questions stay in test until they have enough votes
  if (votes < MIN_SAMPLE_SIZE) return "test";

  const weakSplit = ss < 40;
  const weakEngagement = (reasonCtr ?? 0) < 5 && (replyRate ?? 0) < 2;
  const strongSplit = ss >= 60;
  const strongEngagement = (reasonCtr ?? 0) >= 15 || (replyRate ?? 0) >= 5;
  const highHeat = (metrics.heatScore ?? 0) >= 50;

  // v2 quality signals — use when available, safe defaults when not
  const skip = metrics.skipRate ?? 0;
  const feedback = metrics.feedbackRate ?? 0;
  const quality = metrics.qualityScore ?? 50; // neutral default

  // Penalty triggers: high skip (>40%) or high negative feedback (>20%)
  const heavilySkipped = skip > 40;
  const heavilyDisliked = feedback > 20;

  // Archive: original criteria OR strong negative signals
  if (weakSplit && weakEngagement) return "archive";
  if (votes >= 10 && (heavilySkipped || heavilyDisliked) && quality < 30) return "archive";

  // Rising: must not be penalized
  if (highHeat && strongEngagement && !heavilySkipped && !heavilyDisliked) return "rising";

  // Evergreen: decent quality required
  if (strongSplit && votes >= 10 && quality >= 35) return "evergreen";

  return "test";
}

/**
 * Merge a question with its metrics snapshot into a unified ops view.
 */
export function mergeQuestionWithMetrics(
  question: Question,
  snapshot?: Partial<QuestionMetricsSnapshot> | null,
) {
  const ops = getQuestionOpsMetrics(question, snapshot);
  const status = deriveQuestionStatus(ops);
  return { question, ops, derivedStatus: status };
}

/**
 * Sort questions by split quality (best split first).
 */
export function sortBySplit(questions: Question[]): Question[] {
  return [...questions].sort(
    (a, b) => splitScore(b.resultA, b.resultB) - splitScore(a.resultA, a.resultB),
  );
}

/**
 * Create an empty metrics snapshot for a question.
 */
export function emptySnapshot(questionId: string): QuestionMetricsSnapshot {
  return {
    questionId,
    timestamp: new Date().toISOString(),
    voteCount: 0,
    reasonCtr: 0,
    replyRate: 0,
    nextRate: 0,
    splitScore: 0,
    splitGrade: "C",
    heatScore: 0,
    longevityScore: 0,
    skipRate: 0,
    feedbackRate: 0,
    reasonEngagementRate: 0,
    qualityScore: 50, // neutral default — not penalized, not rewarded
  };
}

/**
 * Compute a basic split score from raw vote numbers.
 * Re-exported for convenience.
 */
export function splitScoreFromVotes(votesA: number, votesB: number): number {
  const total = votesA + votesB;
  if (total === 0) return 0;
  return splitScore(
    Math.round((votesA / total) * 100),
    Math.round((votesB / total) * 100),
  );
}

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
  };
}

/** Minimum votes required before a question can be judged (low-sample guard) */
const MIN_SAMPLE_SIZE = 5;

/**
 * Derive question lifecycle status from operating metrics.
 *
 * Simple first-pass heuristic:
 * - test: default / not enough data (under MIN_SAMPLE_SIZE votes)
 * - archive: enough data AND weak split AND low engagement
 * - rising: high heat AND strong engagement
 * - evergreen: good split AND stable engagement
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

  if (weakSplit && weakEngagement) return "archive";
  if (highHeat && strongEngagement) return "rising";
  if (strongSplit && votes >= 10) return "evergreen";
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

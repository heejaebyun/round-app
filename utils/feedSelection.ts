import type { Question, QuestionMetricsSnapshot, QuestionStatus } from "@/lib/types";
import { getQuestionOpsMetrics, deriveQuestionStatus } from "./questionOps";

/**
 * Feed selection policy — determines which questions are eligible
 * and in what priority order.
 *
 * Policy:
 *   - archive: excluded
 *   - rising: prioritized (top)
 *   - evergreen: stable mid-tier
 *   - test: included at reduced density (end)
 */
export function getActiveFeedQuestions(
  questions: Question[],
  metricsMap: Map<string, QuestionMetricsSnapshot> | null,
): Question[] {
  type Bucket = { q: Question; status: QuestionStatus; heat: number };

  const rising: Bucket[] = [];
  const evergreen: Bucket[] = [];
  const test: Bucket[] = [];

  for (const q of questions) {
    const snapshot = metricsMap?.get(q.id) ?? null;
    const ops = getQuestionOpsMetrics(q, snapshot);
    const status = deriveQuestionStatus(ops);

    if (status === "archive") continue; // excluded

    const bucket: Bucket = { q, status, heat: ops.heatScore ?? 0 };

    if (status === "rising") rising.push(bucket);
    else if (status === "evergreen") evergreen.push(bucket);
    else test.push(bucket);
  }

  // Sort within buckets: heat desc
  const byHeat = (a: Bucket, b: Bucket) => b.heat - a.heat;
  rising.sort(byHeat);
  evergreen.sort(byHeat);

  // Test questions: shuffle (experimental)
  for (let i = test.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [test[i], test[j]] = [test[j], test[i]];
  }

  const ordered = [...rising, ...evergreen, ...test];

  if (process.env.NODE_ENV === "development") {
    const counts = { rising: rising.length, evergreen: evergreen.length, test: test.length };
    console.log("[Round Feed] selection:", counts, "excluded:", questions.length - ordered.length);
  }

  return ordered.map((b) => b.q);
}

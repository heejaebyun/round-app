import { NextRequest, NextResponse } from "next/server";
import { SEED_QUESTIONS } from "@/data/questions";
import { getQuestionMetrics, getQuestionMetricsBatch } from "@/lib/questionMetrics";
import { getQuestionFeedbackSummary, getQuestionFeedbackBatch } from "@/lib/questionFeedbackSummary";
import { getQuestionOpsMetrics, deriveQuestionStatus } from "@/utils/questionOps";

const INTERNAL_KEY = process.env.INTERNAL_API_KEY?.trim();

function isAuthorized(request: NextRequest): boolean {
  // fail-closed: 프로덕션에서 키 없으면 거부
  if (!INTERNAL_KEY) return process.env.NODE_ENV !== "production";
  return request.headers.get("x-internal-key")?.trim() === INTERNAL_KEY;
}

/**
 * GET /api/internal/question-inspect?id=d1-01
 *   → single question ops view
 *
 * GET /api/internal/question-inspect?all=true
 *   → all active questions summary (compact)
 */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const questionId = request.nextUrl.searchParams.get("id");
  const all = request.nextUrl.searchParams.get("all") === "true";

  // ─── Single question ───
  if (questionId) {
    const question = SEED_QUESTIONS.find((q) => q.id === questionId);
    if (!question) return NextResponse.json({ message: "question not found" }, { status: 404 });

    const snapshot = await getQuestionMetrics(questionId);
    const ops = getQuestionOpsMetrics(question, snapshot);
    const status = deriveQuestionStatus(ops);
    const feedback = await getQuestionFeedbackSummary(questionId);

    return NextResponse.json({
      questionId,
      question: question.question,
      topic: question.topic,
      tension: question.tension,
      ops,
      derivedStatus: status,
      feedback,
      snapshotRaw: snapshot,
    });
  }

  // ─── All questions summary ───
  if (all) {
    const ids = SEED_QUESTIONS.map((q) => q.id);
    const metricsMap = await getQuestionMetricsBatch(ids);
    const feedbackMap = await getQuestionFeedbackBatch(ids);

    const items = SEED_QUESTIONS.map((q) => {
      const snapshot = metricsMap.get(q.id) ?? null;
      const ops = getQuestionOpsMetrics(q, snapshot);
      const status = deriveQuestionStatus(ops);
      const fb = feedbackMap.get(q.id);

      return {
        id: q.id,
        question: q.question,
        topic: q.topic,
        tension: q.tension,
        splitGrade: ops.splitGrade,
        splitScore: ops.splitScore,
        heatScore: ops.heatScore ?? 0,
        longevityScore: ops.longevityScore ?? 0,
        voteCount: ops.voteCount ?? 0,
        reasonCtr: ops.reasonCtr ?? 0,
        derivedStatus: status,
        feedbackTotal: fb?.total ?? 0,
      };
    });

    // Sort by heat desc
    items.sort((a, b) => (b.heatScore ?? 0) - (a.heatScore ?? 0));

    const statusCounts: Record<string, number> = {};
    for (const item of items) {
      statusCounts[item.derivedStatus] = (statusCounts[item.derivedStatus] ?? 0) + 1;
    }

    return NextResponse.json({
      total: items.length,
      statusCounts,
      questions: items,
    });
  }

  return NextResponse.json({ message: "id or all=true required" }, { status: 400 });
}

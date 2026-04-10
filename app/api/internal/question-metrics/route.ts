import { NextRequest, NextResponse } from "next/server";
import { updateQuestionSnapshot, updateActiveQuestionSnapshots } from "@/utils/snapshotUpdater";

const INTERNAL_KEY = process.env.INTERNAL_API_KEY?.trim();

function isAuthorized(request: NextRequest): boolean {
  // fail-closed: 프로덕션에서 키 없으면 거부
  if (!INTERNAL_KEY) return process.env.NODE_ENV !== "production";
  return request.headers.get("x-internal-key")?.trim() === INTERNAL_KEY;
}

/**
 * POST /api/internal/question-metrics
 *
 * Body:
 *   { "questionId": "d1-01" }   → update single question
 *   { "batch": true }           → update all active questions
 */
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    questionId?: string;
    batch?: boolean;
  } | null;

  // Batch update
  if (body?.batch) {
    const result = await updateActiveQuestionSnapshots();
    return NextResponse.json(result);
  }

  // Single question update
  if (body?.questionId) {
    const ok = await updateQuestionSnapshot(body.questionId);
    return NextResponse.json({ questionId: body.questionId, ok });
  }

  return NextResponse.json({ message: "questionId or batch required" }, { status: 400 });
}

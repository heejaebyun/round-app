import { NextRequest, NextResponse } from "next/server";
import { createQuestionCandidate, listQuestionCandidates } from "@/lib/questionCandidates";
import { isAuthorized } from "@/lib/internalAuth";
import type { QuestionCandidateInsert, QuestionCandidateReviewStatus } from "@/lib/types";

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const status = request.nextUrl.searchParams.get("status") as QuestionCandidateReviewStatus | null;
  const items = await listQuestionCandidates(status ?? undefined);
  return NextResponse.json({ total: items.length, items });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as QuestionCandidateInsert | null;
  if (!body?.question || !body.optionA || !body.optionB || !body.category || !body.topic || !body.tension || !body.valueA || !body.valueB) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
  }

  const result = await createQuestionCandidate(body);
  if (!result.ok) {
    return NextResponse.json({ message: result.error ?? "Create failed" }, { status: 500 });
  }

  return NextResponse.json(result);
}

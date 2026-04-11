import { NextRequest, NextResponse } from "next/server";
import { approveQuestionCandidate } from "@/lib/questionCandidates";
import { isAuthorized } from "@/lib/internalAuth";

export async function POST(
  request: NextRequest,
  context: RouteContext<"/api/internal/question-candidates/[id]/approve">,
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ message: "Candidate id required" }, { status: 400 });
  }

  const result = await approveQuestionCandidate(id);
  if (!result.ok) {
    return NextResponse.json({ message: result.error ?? "Approve failed" }, { status: 500 });
  }

  return NextResponse.json(result);
}

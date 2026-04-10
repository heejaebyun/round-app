import { NextRequest, NextResponse } from "next/server";
import { rejectQuestionCandidate } from "@/lib/questionCandidates";

const INTERNAL_KEY = process.env.INTERNAL_API_KEY?.trim();

function isAuthorized(request: NextRequest): boolean {
  if (!INTERNAL_KEY) return process.env.NODE_ENV !== "production";
  return request.headers.get("x-internal-key")?.trim() === INTERNAL_KEY;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ message: "Candidate id required" }, { status: 400 });
  }

  const result = await rejectQuestionCandidate(id);
  if (!result.ok) {
    return NextResponse.json({ message: result.error ?? "Reject failed" }, { status: 500 });
  }

  return NextResponse.json(result);
}

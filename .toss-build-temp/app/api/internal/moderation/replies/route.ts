import { NextRequest, NextResponse } from "next/server";
import { listRecentReplies } from "@/lib/replyModeration";
import { isAuthorized } from "@/lib/internalAuth";

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const limitParam = Number(request.nextUrl.searchParams.get("limit") ?? "20");
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 20;
  const items = await listRecentReplies(limit);

  return NextResponse.json({ total: items.length, items });
}

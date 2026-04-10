import { NextRequest, NextResponse } from "next/server";
import { deleteReply } from "@/lib/replyModeration";

const INTERNAL_KEY = process.env.INTERNAL_API_KEY?.trim();

function isAuthorized(request: NextRequest): boolean {
  if (!INTERNAL_KEY) return process.env.NODE_ENV !== "production";
  return request.headers.get("x-internal-key")?.trim() === INTERNAL_KEY;
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext<"/api/internal/moderation/replies/[id]">,
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const result = await deleteReply(id);
  if (!result.ok) {
    return NextResponse.json({ message: result.error ?? "Delete failed" }, { status: 500 });
  }

  return NextResponse.json(result);
}

import { NextRequest, NextResponse } from "next/server";
import { deleteReply } from "@/lib/replyModeration";
import { isAuthorized } from "@/lib/internalAuth";

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

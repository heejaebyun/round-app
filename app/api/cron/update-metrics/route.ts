import { NextRequest, NextResponse } from "next/server";
import { updateActiveQuestionSnapshots } from "@/utils/snapshotUpdater";

const INTERNAL_KEY = process.env.INTERNAL_API_KEY?.trim();

function isAuthorized(request: NextRequest): boolean {
  // fail-closed: 프로덕션에서 키 없으면 거부
  if (!INTERNAL_KEY) return process.env.NODE_ENV !== "production";
  return request.headers.get("x-internal-key")?.trim() === INTERNAL_KEY;
}

/**
 * Cron endpoint for scheduled metrics updates.
 * - called by GitHub Actions on a schedule
 * - directly invokes updater util (no internal HTTP hop)
 */
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const startedAt = new Date().toISOString();
  try {
    const result = await updateActiveQuestionSnapshots();
    return NextResponse.json({
      ok: true,
      startedAt,
      finishedAt: new Date().toISOString(),
      ...result,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ ok: false, startedAt, error: message }, { status: 500 });
  }
}

// GitHub Actions에서 POST 대신 GET으로도 호출 가능하게
export async function GET(request: NextRequest) {
  return POST(request);
}

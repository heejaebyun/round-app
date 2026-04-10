import { NextRequest, NextResponse } from "next/server";
import { anonymizeMemberByTossUserKey } from "@/lib/members";

function withCors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
  return response;
}

function isAuthorized(request: NextRequest) {
  const expected = process.env.TOSS_UNLINK_BASIC_AUTH?.trim();
  if (!expected) return true;
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Basic ")) return false;

  const provided = authorization.slice("Basic ".length).trim();

  if (provided === expected) return true;

  try {
    const decoded = Buffer.from(provided, "base64").toString("utf-8");
    return decoded === expected;
  } catch {
    return false;
  }
}

function parseUserKey(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

async function handleUnlink(request: NextRequest, body?: Record<string, unknown> | null) {
  if (!isAuthorized(request)) {
    return withCors(NextResponse.json({ message: "Unauthorized" }, { status: 401 }));
  }

  const searchUserKey = request.nextUrl.searchParams.get("userKey")
    ?? request.nextUrl.searchParams.get("user_key");
  const userKey = parseUserKey(body?.userKey ?? body?.user_key ?? searchUserKey);

  // userKey 없이 호출 = 토스 콘솔 연결 테스트 → 200으로 응답
  if (!userKey) {
    return withCors(NextResponse.json({ ok: true, message: "콜백 연결 확인 완료" }));
  }

  const result = await anonymizeMemberByTossUserKey(userKey);
  if (!result.ok) {
    return withCors(NextResponse.json(
      { message: result.message || "회원 비식별화에 실패했어요." },
      { status: 500 },
    ));
  }

  return withCors(NextResponse.json({ ok: true }));
}

export async function GET(request: NextRequest) {
  return handleUnlink(request);
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  return handleUnlink(request, body);
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

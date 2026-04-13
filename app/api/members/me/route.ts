import { NextRequest, NextResponse } from "next/server";
import {
  TOSS_ACCESS_COOKIE,
  TOSS_REFRESH_COOKIE,
  buildSession,
  clearAuthCookies,
  fetchTossLoginMe,
  refreshAccessToken,
  setAuthCookies,
} from "@/lib/toss-login";
import { ensureMemberFromSession, updateMemberNickname } from "@/lib/members";
import { optionsResponse, withCors } from "@/lib/api-response";
import { decryptTossProfile } from "@/lib/toss-decrypt";

async function resolveSession(accessToken: string, referrer: "DEFAULT" | "SANDBOX") {
  const me = await fetchTossLoginMe(accessToken);
  const { name, email } = decryptTossProfile(me);
  return buildSession({ ...me, name, email }, referrer);
}

export function OPTIONS(request: NextRequest) {
  return optionsResponse(request);
}

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get(TOSS_ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(TOSS_REFRESH_COOKIE)?.value;

  if (!accessToken && !refreshToken) {
    return withCors(request, NextResponse.json({ authenticated: false, session: null, member: null, needsNickname: false }));
  }

  try {
    if (!accessToken) throw new Error("missing_access_token");
    const session = await resolveSession(accessToken, "DEFAULT");
    const member = await ensureMemberFromSession(session);
    return withCors(request, NextResponse.json({
      authenticated: true,
      session,
      member,
      needsNickname: !member?.nickname,
    }));
  } catch (error) {
    if (!refreshToken) {
      const response = NextResponse.json({ authenticated: false, session: null, member: null, needsNickname: false });
      clearAuthCookies(response);
      return withCors(request, response);
    }

    try {
      const tokens = await refreshAccessToken(refreshToken);
      const session = await resolveSession(tokens.accessToken, "DEFAULT");
      const member = await ensureMemberFromSession(session);
      const response = NextResponse.json({
        authenticated: true,
        session,
        member,
        needsNickname: !member?.nickname,
      });
      setAuthCookies(response, tokens);
      return withCors(request, response);
    } catch {
      const response = NextResponse.json(
        {
          authenticated: false,
          session: null,
          member: null,
          needsNickname: false,
          message:
            error instanceof Error && error.message !== "missing_access_token"
              ? error.message
              : undefined,
        },
      );
      clearAuthCookies(response);
      return withCors(request, response);
    }
  }
}

export async function PATCH(request: NextRequest) {
  const accessToken = request.cookies.get(TOSS_ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(TOSS_REFRESH_COOKIE)?.value;

  if (!accessToken && !refreshToken) {
    return withCors(request, NextResponse.json({ message: "로그인이 필요해요." }, { status: 401 }));
  }

  let session = null as Awaited<ReturnType<typeof resolveSession>> | null;
  let refreshedTokens: Awaited<ReturnType<typeof refreshAccessToken>> | null = null;

  try {
    if (!accessToken) throw new Error("missing_access_token");
    session = await resolveSession(accessToken, "DEFAULT");
  } catch {
    if (!refreshToken) {
      return withCors(request, NextResponse.json({ message: "로그인이 만료됐어요." }, { status: 401 }));
    }
    try {
      refreshedTokens = await refreshAccessToken(refreshToken);
      session = await resolveSession(refreshedTokens.accessToken, "DEFAULT");
    } catch {
      const response = NextResponse.json({ message: "로그인이 만료됐어요." }, { status: 401 });
      clearAuthCookies(response);
      return withCors(request, response);
    }
  }

  const body = (await request.json().catch(() => null)) as { nickname?: string } | null;
  if (!body?.nickname) {
    return withCors(request, NextResponse.json({ message: "닉네임을 입력해주세요." }, { status: 400 }));
  }

  const { member, message } = await updateMemberNickname(session.userKey, body.nickname);
  if (!member) {
    return withCors(request, NextResponse.json({ message: message || "닉네임 저장에 실패했어요." }, { status: 400 }));
  }

  const response = NextResponse.json({ ok: true, member });
  if (refreshedTokens) setAuthCookies(response, refreshedTokens);
  return withCors(request, response);
}

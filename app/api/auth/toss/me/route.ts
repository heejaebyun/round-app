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
import { decryptTossProfile } from "@/lib/toss-decrypt";

async function resolveSession(accessToken: string, referrer: "DEFAULT" | "SANDBOX") {
  const me = await fetchTossLoginMe(accessToken);
  const { name, email } = decryptTossProfile(me);
  return buildSession({ ...me, name, email }, referrer);
}

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get(TOSS_ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(TOSS_REFRESH_COOKIE)?.value;

  if (!accessToken && !refreshToken) {
    return NextResponse.json({ authenticated: false, session: null });
  }

  try {
    if (!accessToken) throw new Error("missing_access_token");
    const session = await resolveSession(accessToken, "DEFAULT");
    return NextResponse.json({ authenticated: true, session });
  } catch (error) {
    if (!refreshToken) {
      const response = NextResponse.json({ authenticated: false, session: null });
      clearAuthCookies(response);
      return response;
    }

    try {
      const tokens = await refreshAccessToken(refreshToken);
      const session = await resolveSession(tokens.accessToken, "DEFAULT");
      const response = NextResponse.json({ authenticated: true, session });
      setAuthCookies(response, tokens);
      return response;
    } catch {
      const response = NextResponse.json(
        {
          authenticated: false,
          session: null,
          message:
            error instanceof Error && error.message !== "missing_access_token"
              ? error.message
              : undefined,
        },
      );
      clearAuthCookies(response);
      return response;
    }
  }
}

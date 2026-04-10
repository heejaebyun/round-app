import { NextRequest, NextResponse } from "next/server";
import {
  buildSession,
  exchangeAuthorizationCode,
  fetchTossLoginMe,
  setAuthCookies,
  type TossLoginReferrer,
} from "@/lib/toss-login";
import { ensureMemberFromSession } from "@/lib/members";
import { decryptTossProfile } from "@/lib/toss-decrypt";
import { optionsResponse, withCors } from "@/lib/api-response";

export function OPTIONS(request: NextRequest) {
  return optionsResponse(request);
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let body:
      | {
          authorizationCode?: string;
          referrer?: TossLoginReferrer;
        }
      | null = null;

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const form = await request.formData().catch(() => null);
      body = form
        ? {
            authorizationCode: form.get("authorizationCode")?.toString(),
            referrer: form.get("referrer")?.toString() as TossLoginReferrer | undefined,
          }
        : null;
    } else {
      body = (await request.json().catch(() => null)) as
        | {
            authorizationCode?: string;
            referrer?: TossLoginReferrer;
          }
        | null;
    }

    if (!body?.authorizationCode || !body?.referrer) {
      return withCors(request, NextResponse.json(
        { message: "인가 코드가 없어서 토스 로그인을 진행할 수 없어요." },
        { status: 400 },
      ));
    }

    const tokens = await exchangeAuthorizationCode(
      body.authorizationCode,
      body.referrer,
    );
    const me = await fetchTossLoginMe(tokens.accessToken);

    // 토스 응답의 name/email이 암호화되어 있을 수 있음 → 복호화
    const { name, email } = decryptTossProfile(me);
    const decryptedMe = { ...me, name, email };

    const session = buildSession(decryptedMe, body.referrer);
    const member = await ensureMemberFromSession(session);

    const response = NextResponse.json({
      authenticated: true,
      session,
      member,
      needsNickname: !member?.nickname,
    });
    setAuthCookies(response, tokens);
    return withCors(request, response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "토스 로그인에 실패했어요.";
    return withCors(request, NextResponse.json({ message }, { status: 500 }));
  }
}

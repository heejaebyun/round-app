import type { NextResponse } from "next/server";
import https from "https";

export type TossLoginReferrer = "DEFAULT" | "SANDBOX";

export interface TossLoginSession {
  userKey: number;
  name?: string | null;
  email?: string | null;
  scope: string[];
  agreedTerms: string[];
  referrer: TossLoginReferrer;
}

interface TossSuccess<T> {
  resultType: "SUCCESS";
  success: T;
}

interface TossFail {
  resultType: "FAIL";
  error?: {
    errorCode?: string;
    reason?: string;
  };
}

interface TossOAuthTokens {
  tokenType: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  scope: string;
}

interface TossLoginMe {
  userKey: number;
  name?: string | null;
  scope: string;
  agreedTerms: string[];
  email?: string | null;
}

const TOSS_API_BASE = "https://apps-in-toss-api.toss.im";
export const TOSS_ACCESS_COOKIE = "round_toss_access";
export const TOSS_REFRESH_COOKIE = "round_toss_refresh";

function getCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

function mtlsRequest(
  url: string,
  method: string,
  headers: Record<string, string>,
  body?: string,
): Promise<{ status: number; body: string }> {
  const cert = process.env.TOSS_MTLS_CERT;
  const key = process.env.TOSS_MTLS_KEY;

  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options: https.RequestOptions = {
      hostname: parsed.hostname,
      port: 443,
      path: parsed.pathname + parsed.search,
      method,
      headers: { ...headers, "Content-Type": "application/json" },
    };

    if (cert && key) {
      options.cert = cert;
      options.key = key;
    }

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => resolve({ status: res.statusCode ?? 500, body: data }));
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

async function requestToss<T>(
  path: string,
  init: RequestInit,
): Promise<T> {
  const url = `${TOSS_API_BASE}${path}`;
  const method = (init.method ?? "GET").toUpperCase();
  const headers: Record<string, string> = {};
  if (init.headers) {
    const h = init.headers as Record<string, string>;
    for (const [k, v] of Object.entries(h)) headers[k] = v;
  }
  const bodyStr = init.body ? String(init.body) : undefined;

  const res = await mtlsRequest(url, method, headers, bodyStr);
  const json = (() => { try { return JSON.parse(res.body); } catch { return null; } })() as
    | TossSuccess<T>
    | TossFail
    | { error?: string }
    | null;

  const ok = res.status >= 200 && res.status < 300;

  if (!ok) {
    let reason = "토스 로그인 요청에 실패했어요.";
    if (json && "error" in json) {
      if (typeof json.error === "string") {
        reason = json.error;
      } else if (json.error?.reason) {
        reason = json.error.reason;
      }
    }
    throw new Error(reason);
  }

  if (json && "resultType" in json) {
    if (json.resultType === "SUCCESS") return json.success;
    throw new Error(json.error?.reason || "토스 로그인 응답이 올바르지 않아요.");
  }

  if (json && "error" in json && typeof json.error === "string") {
    throw new Error(json.error);
  }

  throw new Error("토스 로그인 응답을 읽지 못했어요.");
}

export async function exchangeAuthorizationCode(
  authorizationCode: string,
  referrer: TossLoginReferrer,
) {
  return requestToss<TossOAuthTokens>(
    "/api-partner/v1/apps-in-toss/user/oauth2/generate-token",
    {
      method: "POST",
      body: JSON.stringify({ authorizationCode, referrer }),
    },
  );
}

export async function refreshAccessToken(refreshToken: string) {
  return requestToss<TossOAuthTokens>(
    "/api-partner/v1/apps-in-toss/user/oauth2/refresh-token",
    {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    },
  );
}

export async function fetchTossLoginMe(accessToken: string) {
  return requestToss<TossLoginMe>(
    "/api-partner/v1/apps-in-toss/user/oauth2/login-me",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
}

export async function unlinkTossAccess(accessToken: string) {
  try {
    await requestToss<{ userKey?: number }>(
      "/api-partner/v1/apps-in-toss/user/oauth2/access/remove-by-access-token",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
  } catch {
    // 로그아웃 UX를 막지 않기 위해 best effort로 처리.
  }
}

export function normalizeScope(scope: string) {
  return scope
    .split(/[,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function buildSession(
  me: TossLoginMe,
  referrer: TossLoginReferrer,
): TossLoginSession {
  return {
    userKey: me.userKey,
    name: me.name ?? null,
    email: me.email ?? null,
    scope: normalizeScope(me.scope),
    agreedTerms: me.agreedTerms ?? [],
    referrer,
  };
}

export function setAuthCookies(
  response: NextResponse,
  tokens: TossOAuthTokens,
) {
  response.cookies.set(
    TOSS_ACCESS_COOKIE,
    tokens.accessToken,
    getCookieOptions(tokens.expiresIn),
  );
  response.cookies.set(
    TOSS_REFRESH_COOKIE,
    tokens.refreshToken,
    getCookieOptions(60 * 60 * 24 * 14),
  );
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(TOSS_ACCESS_COOKIE, "", getCookieOptions(0));
  response.cookies.set(TOSS_REFRESH_COOKIE, "", getCookieOptions(0));
}

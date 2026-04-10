import { NextRequest, NextResponse } from "next/server";
import {
  TOSS_ACCESS_COOKIE,
  clearAuthCookies,
  unlinkTossAccess,
} from "@/lib/toss-login";
import { optionsResponse, withCors } from "@/lib/api-response";

export function OPTIONS(request: NextRequest) {
  return optionsResponse(request);
}

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get(TOSS_ACCESS_COOKIE)?.value;
  if (accessToken) {
    await unlinkTossAccess(accessToken);
  }

  const response = NextResponse.json({ ok: true });
  clearAuthCookies(response);
  return withCors(request, response);
}

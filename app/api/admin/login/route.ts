import { NextRequest, NextResponse } from "next/server";
import { adminEmailMatches, buildAdminCookie } from "@/lib/internalAuth";

export async function POST(request: NextRequest) {
  let email = "";
  try {
    const body = (await request.json()) as { email?: string };
    email = (body.email ?? "").trim();
  } catch {
    // fall through
  }

  if (!email) {
    return NextResponse.json({ ok: false, message: "email required" }, { status: 400 });
  }

  if (!adminEmailMatches(email)) {
    return NextResponse.json({ ok: false, message: "not authorized" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, email: email.toLowerCase() });
  res.headers.set("Set-Cookie", buildAdminCookie(email));
  return res;
}

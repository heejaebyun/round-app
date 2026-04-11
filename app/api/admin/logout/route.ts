import { NextResponse } from "next/server";
import { buildAdminClearCookie } from "@/lib/internalAuth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", buildAdminClearCookie());
  return res;
}

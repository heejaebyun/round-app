import { NextRequest, NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/internalAuth";

export async function GET(request: NextRequest) {
  const email = getAdminEmail(request);
  return NextResponse.json({ authenticated: !!email, email });
}

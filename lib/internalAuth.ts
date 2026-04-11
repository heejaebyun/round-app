import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

/**
 * Shared auth helper for /api/internal/* routes.
 *
 * Two ways to pass:
 *   1. `x-internal-key` header === INTERNAL_API_KEY (server-to-server,
 *      scripts, curl, etc.)
 *   2. `round_admin` signed cookie matching ADMIN_EMAIL
 *      (browser session, set by /api/admin/login)
 *
 * Dev mode: if INTERNAL_API_KEY is missing we still allow requests
 * so local dev doesn't require the full env set.
 */

const INTERNAL_KEY = process.env.INTERNAL_API_KEY?.trim();
const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? "";

const COOKIE_NAME = "round_admin";
const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days

function getSecret(): string {
  // Re-use INTERNAL_API_KEY as the HMAC secret — same trust level.
  return INTERNAL_KEY ?? "round-dev-secret";
}

function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

/** Build the cookie string for the /api/admin/login Set-Cookie header. */
export function buildAdminCookie(email: string): string {
  const normalized = email.trim().toLowerCase();
  const sig = sign(normalized);
  const payload = `${normalized}.${sig}`;
  return [
    `${COOKIE_NAME}=${encodeURIComponent(payload)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Secure",
    `Max-Age=${COOKIE_MAX_AGE_SEC}`,
  ].join("; ");
}

/** Build the Set-Cookie header that clears the session. */
export function buildAdminClearCookie(): string {
  return [`${COOKIE_NAME}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Secure", "Max-Age=0"].join("; ");
}

/** Verify signed cookie and return the email if valid. */
function verifyAdminCookie(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    const dot = decoded.lastIndexOf(".");
    if (dot === -1) return null;
    const email = decoded.slice(0, dot);
    const sig = decoded.slice(dot + 1);
    const expected = sign(email);
    if (sig.length !== expected.length) return null;
    if (!timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) return null;
    return email;
  } catch {
    return null;
  }
}

/** Parse the round_admin cookie off a NextRequest. */
function readAdminCookie(request: NextRequest): string | null {
  const value = request.cookies.get(COOKIE_NAME)?.value;
  return verifyAdminCookie(value);
}

/**
 * Main guard. Returns true when the request can hit internal endpoints.
 *
 * Order:
 *   1. x-internal-key header match
 *   2. round_admin cookie matches ADMIN_EMAIL
 *   3. dev fallback
 */
export function isAuthorized(request: NextRequest): boolean {
  if (INTERNAL_KEY) {
    const headerKey = request.headers.get("x-internal-key")?.trim();
    if (headerKey === INTERNAL_KEY) return true;
  }

  if (ADMIN_EMAIL) {
    const cookieEmail = readAdminCookie(request);
    if (cookieEmail && cookieEmail === ADMIN_EMAIL) return true;
  }

  // Dev fallback: if no INTERNAL_API_KEY is configured and we're not
  // in production, allow requests so local dev doesn't require env.
  if (!INTERNAL_KEY && process.env.NODE_ENV !== "production") {
    return true;
  }

  return false;
}

/** Exposed so /api/admin/login can reject mismatched emails. */
export function adminEmailMatches(email: string): boolean {
  if (!ADMIN_EMAIL) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL;
}

/** Exposed so /api/admin/me can report whether the current session is admin. */
export function getAdminEmail(request: NextRequest): string | null {
  const email = readAdminCookie(request);
  if (!email) return null;
  if (!ADMIN_EMAIL) return null;
  return email === ADMIN_EMAIL ? email : null;
}

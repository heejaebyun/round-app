"use client";

import { isTossMiniApp } from "./toss";

/**
 * API fetch wrapper.
 *
 * Web: relative path (same-origin, cookies work)
 * Toss mini-app: absolute URL to Vercel production origin
 *   (.ait is a static bundle — no API routes inside)
 */
const VERCEL_ORIGIN = "https://round-app-one.vercel.app";

export async function apiFetch(path: string, init?: RequestInit) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const isToss = typeof window !== "undefined" && isTossMiniApp();
  const url = isToss ? `${VERCEL_ORIGIN}${normalizedPath}` : normalizedPath;

  return fetch(url, {
    ...init,
    // Cross-origin (Toss → Vercel): "omit" because allow-credentials
    // requires explicit CORS headers. Auth is handled by Toss SDK token
    // in the request body, not cookies.
    credentials: isToss ? "omit" : "include",
  });
}

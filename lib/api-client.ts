"use client";

/**
 * API fetch — 항상 상대 경로로 호출.
 * 토스 WebView에서 cross-origin 쿠키 문제 방지.
 */
export async function apiFetch(path: string, init?: RequestInit) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return fetch(normalizedPath, {
    ...init,
    credentials: "include",
  });
}

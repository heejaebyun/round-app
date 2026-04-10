/**
 * 토스 미니앱 환경 감지.
 * userAgent에 "TossApp"이 포함되거나, 토스 bridge가 존재하면 토스 환경.
 */
export function isTossMiniApp(): boolean {
  if (typeof window === "undefined") return false;

  const ua = navigator.userAgent || "";
  if (ua.includes("TossApp")) return true;

  // 토스 WebView bridge 존재 여부
  if ("TossAppBridge" in window) return true;
  if ("ReactNativeWebView" in window && ua.includes("Toss")) return true;

  return false;
}

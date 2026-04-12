"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { appLogin } from "@apps-in-toss/web-framework";
import { apiFetch } from "@/lib/api-client";
import { isTossMiniApp } from "@/lib/toss";
import { trackEvent } from "@/utils/analytics";
import { useLocale } from "@/hooks/useLocale";
import { buildLocalizedPath } from "@/lib/localeRouting";

interface TossSession {
  userKey: number;
  email?: string | null;
  scope: string[];
  agreedTerms: string[];
  referrer: "DEFAULT" | "SANDBOX";
}

interface TossMember {
  nickname: string | null;
}

interface TossLoginButtonProps {
  variant?: "compact" | "hero";
  onStateChange?: (state: { ready: boolean; authenticated: boolean }) => void;
}

export default function TossLoginButton({
  variant = "compact",
  onStateChange,
}: TossLoginButtonProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const [enabled, setEnabled] = useState(false);
  const [pending, setPending] = useState(false);
  const [session, setSession] = useState<TossSession | null>(null);
  const [member, setMember] = useState<TossMember | null>(null);
  const [error, setError] = useState<string | null>(null);
  const nicknameHref = buildLocalizedPath("/onboarding/nickname", locale);

  useEffect(() => {
    if (!isTossMiniApp()) {
      onStateChange?.({ ready: true, authenticated: false });
      return;
    }
    setEnabled(true);

    void apiFetch("/api/members/me", { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json()) as {
          authenticated?: boolean;
          session?: TossSession | null;
          member?: TossMember | null;
          needsNickname?: boolean;
        };
        if (data.authenticated) {
          setSession(data.session ?? null);
          setMember(data.member ?? null);
          onStateChange?.({ ready: true, authenticated: true });
          if (data.needsNickname) router.push(nicknameHref);
          return;
        }
        setSession(null);
        setMember(null);
        onStateChange?.({ ready: true, authenticated: false });
      })
      .catch(() => {
        onStateChange?.({ ready: true, authenticated: false });
      });
  }, [nicknameHref, onStateChange, router]);

  const description = useMemo(() => {
    if (member?.nickname) return `@${member.nickname}`;
    if (session) {
      if (session.email) return session.email;
      return session.scope.includes("user_key") ? `회원 키 ${session.userKey}` : "토스 회원 연결됨";
    }
    return "토스 회원으로 계속 이어서 보기";
  }, [member, session]);

  async function handleLogin() {
    setPending(true);
    setError(null);
    trackEvent("toss_login_started");

    try {
      const { authorizationCode, referrer } = await appLogin();
      const response = await apiFetch("/api/auth/toss/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: new URLSearchParams({
          authorizationCode,
          referrer,
        }).toString(),
      });
      const data = (await response.json()) as {
        authenticated?: boolean;
        session?: TossSession | null;
        member?: TossMember | null;
        needsNickname?: boolean;
        message?: string;
      };

      if (!response.ok || !data.authenticated || !data.session) {
        throw new Error(data.message || "토스 로그인 연결에 실패했어요.");
      }

      setSession(data.session);
      setMember(data.member ?? null);
      onStateChange?.({ ready: true, authenticated: true });
      trackEvent("toss_login_succeeded", { referrer: data.session.referrer });
      if (data.needsNickname) router.push(nicknameHref);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "토스 로그인에 실패했어요.";
      setError(message);
      trackEvent("toss_login_failed", { message });
    } finally {
      setPending(false);
    }
  }

  async function handleLogout() {
    setPending(true);
    setError(null);
    try {
      await apiFetch("/api/auth/toss/logout", { method: "POST" });
      setSession(null);
      setMember(null);
      onStateChange?.({ ready: true, authenticated: false });
      trackEvent("toss_logout");
    } catch {
      setError("연결 해제에 실패했어요.");
    } finally {
      setPending(false);
    }
  }

  if (!enabled) return null;

  if (variant === "hero") {
    return (
      <div className="flex w-full flex-col items-center gap-4 text-center">
        {session ? (
          <>
            <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-semibold text-emerald-200">
              토스 연결됨
            </div>
            <button
              type="button"
              disabled={pending}
              onClick={handleLogout}
              className="text-sm font-semibold text-white/44 transition hover:text-white/68 disabled:opacity-50"
            >
              연결 해제
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={pending}
            onClick={handleLogin}
            className="w-full max-w-sm rounded-[24px] bg-[#2F80FF] py-4 text-base font-black text-white shadow-[0_18px_60px_rgba(47,128,255,0.35)] transition active:scale-[0.985] disabled:opacity-50"
          >
            {pending ? "연결 중..." : "동의하고 시작하기"}
          </button>
        )}

        {error && (
          <p className="max-w-sm text-sm leading-6 text-rose-300/85">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {session ? (
        <>
          <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3.5 py-2 text-[11px] font-semibold text-emerald-200">
            토스 연결됨
          </div>
          <div className="max-w-[160px] break-all text-right text-[10px] leading-4 text-white/38">
            {description}
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={handleLogout}
            className="text-[11px] font-semibold text-white/42 transition hover:text-white/65 disabled:opacity-50"
          >
            연결 해제
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            disabled={pending}
            onClick={handleLogin}
            className="rounded-full border border-cyan-300/25 bg-white/6 px-3.5 py-2 text-xs font-semibold text-white shadow-[0_8px_30px_rgba(34,211,238,0.08)] transition hover:bg-white/10 disabled:opacity-50"
          >
            {pending ? "연결 중..." : "토스 로그인"}
          </button>
          <div className="max-w-[160px] break-all text-right text-[10px] leading-4 text-white/38">
            {description}
          </div>
        </>
      )}

      {error && (
        <p className="max-w-[160px] text-right text-[10px] leading-4 text-rose-300/80">
          {error}
        </p>
      )}
    </div>
  );
}

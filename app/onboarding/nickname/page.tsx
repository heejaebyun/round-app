"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { useLocale } from "@/hooks/useLocale";
import { isEnglishLocale } from "@/lib/i18n";

type MemberResponse = {
  authenticated: boolean;
  needsNickname: boolean;
  member: {
    nickname: string | null;
    email: string | null;
  } | null;
};

export default function NicknameOnboardingPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const isEn = isEnglishLocale(locale);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void apiFetch("/api/members/me", { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json()) as MemberResponse;
        if (cancelled) return;

        if (!data.authenticated) {
          router.replace("/");
          return;
        }

        if (!data.needsNickname) {
          router.replace("/");
          return;
        }

        setEmail(data.member?.email ?? null);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(isEn ? "Unable to verify your account." : "회원 정보를 확인할 수 없어요.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setPending(true);
    setError(null);

    try {
      const response = await apiFetch("/api/members/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname }),
      });

      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(data.message || (isEn ? "Failed to save nickname." : "닉네임 저장에 실패했어요."));
      }

      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : (isEn ? "Failed to save nickname." : "닉네임 저장에 실패했어요."));
    } finally {
      setPending(false);
    }
  }

  if (loading) {
    return (
      <main className="round-canvas round-shell items-center justify-center px-6 text-sm text-white/60">
        {isEn ? "Loading your profile…" : "회원 정보를 불러오는 중..."}
      </main>
    );
  }

  return (
    <main className="round-canvas round-shell px-6 py-12">
      <div className="flex w-full flex-1 flex-col justify-center">
        <div className="round-panel-strong rounded-[34px] px-6 py-8">
          <p className="round-mono text-[11px] uppercase tracking-[0.34em] text-cyan-300/70">
            Welcome
          </p>
          <h1 className="mt-4 text-3xl font-black tracking-[-0.05em] text-white">
            {isEn ? "Pick a nickname" : "닉네임을 정해볼까요?"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-white/56">
            {isEn
              ? "You're all signed up. Choose a display name others will see."
              : "토스 회원 가입이 완료됐어요. 다른 사람들에게 보일 이름을 하나 정해주세요."}
          </p>
          {email && (
            <p className="mt-4 text-xs text-cyan-200/75">
              {isEn ? "Connected email:" : "연결된 이메일:"} {email}
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
            <label className="text-sm font-semibold text-white/80">
              {isEn ? "Nickname" : "닉네임"}
              <input
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                maxLength={12}
                placeholder={isEn ? "2–12 chars, letters/numbers/_" : "2~12자, 한글/영문/숫자/_"}
                className="mt-2 w-full rounded-[20px] border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none placeholder:text-white/28"
              />
            </label>

            {error && (
              <p className="text-sm text-rose-300/90">{error}</p>
            )}

            <button
              type="submit"
              disabled={pending || nickname.trim().length < 2}
              className="rounded-[22px] bg-white px-5 py-3.5 text-sm font-bold text-slate-900 disabled:opacity-50"
            >
              {pending ? (isEn ? "Saving…" : "저장 중...") : (isEn ? "Start with this name" : "이 닉네임으로 시작하기")}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

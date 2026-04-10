"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import DNAProfile from "@/components/DNAProfile";
import { useDNA } from "@/hooks/useDNA";
import type { UserChoice } from "@/lib/types";
import { trackEvent } from "@/utils/analytics";
import { STORAGE_KEY_CHOICES } from "@/lib/constants";

export default function DNAPage() {
  const router = useRouter();
  const [choices, setChoices] = useState<UserChoice[]>([]);
  const [mounted, setMounted] = useState(false);
  const hasTrackedView = useRef(false);
  const { dna, progressMessage } = useDNA(choices);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
      try {
        const raw = localStorage.getItem(STORAGE_KEY_CHOICES);
        if (raw) setChoices(JSON.parse(raw));
      } catch {}
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!mounted || hasTrackedView.current) return;
    trackEvent("dna_profile_viewed", {
      totalChoices: choices.length,
      archetype: dna.archetype,
    });
    hasTrackedView.current = true;
  }, [mounted, choices.length, dna.archetype]);

  function handleResetChoices() {
    if (typeof window === "undefined") return;
    const confirmed = window.confirm("지금까지 쌓인 선택 기록을 삭제할까요?");
    if (!confirmed) return;

    try {
      localStorage.removeItem(STORAGE_KEY_CHOICES);
      setChoices([]);
      trackEvent("choices_reset", { from: "dna_page", totalChoices: choices.length });
      router.replace("/");
    } catch {}
  }

  if (!mounted) return null;

  return (
    <div className="round-shell flex h-full flex-col">
      <header className="relative z-10 flex items-center justify-between px-5 pb-4 pt-safe-top">
        <div className="pt-2">
          <p className="round-mono text-[11px] uppercase tracking-[0.36em] text-cyan-300/65">
            DNA
          </p>
          <h1 className="mt-2 text-xl font-black tracking-tight text-white">
            선택으로 쌓인
            <br />
            나의 패턴
          </h1>
        </div>
        <Link
          href="/"
          className="mt-3 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-2 text-xs font-semibold text-white/70"
        >
          돌아가기
        </Link>
      </header>

      <main className="no-scrollbar relative z-10 flex-1 overflow-y-auto px-4 pb-safe-bottom">
        {choices.length === 0 ? (
          <div className="flex min-h-full items-center pb-10">
            <div className="round-panel-strong w-full rounded-[34px] px-6 py-8 text-center">
              <p className="text-5xl">🧬</p>
              <h2 className="mt-5 text-2xl font-black tracking-[-0.04em] text-white">
                아직 DNA가 없어요
              </h2>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-white/56">
                질문에 답하기 시작하면 당신의 Choice DNA가 바로 만들어집니다.
              </p>
              <Link
                href="/"
                className="mt-7 inline-flex rounded-[22px] bg-white px-6 py-3.5 text-sm font-bold text-slate-900"
              >
                질문 시작하기
              </Link>
            </div>
          </div>
        ) : (
          <DNAProfile
            dna={dna}
            progressMessage={progressMessage}
            choices={choices}
            onResetChoices={handleResetChoices}
          />
        )}
      </main>
    </div>
  );
}

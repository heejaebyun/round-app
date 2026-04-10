"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TouchEvent, WheelEvent } from "react";
import { useRouter } from "next/navigation";
import { appLogin } from "@apps-in-toss/web-framework";
import QuestionFeedCard from "@/components/QuestionFeedCard";
import { apiFetch } from "@/lib/api-client";
// CATEGORY_COLORS now used inside QuestionFeedCard
import { heartReason } from "@/lib/reasons";
import { useChoiceState } from "@/hooks/useChoiceState";
import { useQuestionReasons } from "@/hooks/useQuestionReasons";
import { useQuestionResult } from "@/hooks/useQuestionResult";
import { isTossMiniApp } from "@/lib/toss";
import { registerSessionEnd, trackEvent } from "@/utils/analytics";

export default function Home() {
  const router = useRouter();
  const {
    currentQuestion,
    resultQuestion,
    selectedSide,
    showResult,
    choices,
    totalAnswered,
    allDone,
    choose,
    nextQuestion,
    skipQuestion,
    addReason,
  } = useChoiceState();
  const displayQuestion =
    showResult || selectedSide ? resultQuestion ?? currentQuestion : currentQuestion;

  const liveResult = useQuestionResult(
    displayQuestion?.id,
    displayQuestion?.resultA ?? 50,
    displayQuestion?.resultB ?? 50,
    displayQuestion?.totalVotes ?? 0,
    showResult,
  );

  const { bestSame, bestOpposite, allReasons, prependLocalReason } = useQuestionReasons(
    displayQuestion?.id,
    displayQuestion?.reasons ?? [],
    showResult,
    selectedSide,
  );

  const [showNext, setShowNext] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const isTossEnv = mounted && isTossMiniApp();
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastWheelAdvanceRef = useRef(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    trackEvent("session_start", { referrer: document.referrer || "direct" });
    registerSessionEnd();
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!mounted || !isTossEnv) return;

    let cancelled = false;

    void apiFetch("/api/members/me", { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json()) as { authenticated?: boolean };
        if (cancelled) return;
        setAuthenticated(!!data.authenticated);
      })
      .catch(() => {
        if (cancelled) return;
        setAuthenticated(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mounted, isTossEnv]);

  useEffect(() => {
    if (showResult || !currentQuestion) return;
    trackEvent("card_viewed", {
      questionId: currentQuestion.id,
      category: currentQuestion.category,
    });
  }, [showResult, currentQuestion]);

  useEffect(() => {
    if (!showResult) return;
    trackEvent("result_viewed", { questionId: displayQuestion?.id });
    trackEvent("reason_impression", { questionId: displayQuestion?.id });
    const showTimer = setTimeout(() => setShowNext(true), 1200);
    return () => clearTimeout(showTimer);
  }, [showResult, displayQuestion]);

  async function ensureTossLogin() {
    if (!isTossEnv) return true;
    if (authenticated) return true;

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
        needsNickname?: boolean;
        message?: string;
      };

      if (!response.ok || !data.authenticated) {
        throw new Error(data.message || "토스 로그인에 실패했어요.");
      }

      setAuthenticated(true);

      if (data.needsNickname) {
        router.push("/onboarding/nickname");
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  async function handleChoice(side: "A" | "B") {
    if (!(await ensureTossLogin())) return;
    choose(side);
  }

  async function handleOpenDNA() {
    if (!(await ensureTossLogin())) return;
    router.push("/dna");
  }

  const advanceFeed = useCallback(() => {
    if (!displayQuestion) return false;

    // Pre-selection: treat swipe as skip
    if (!showResult && !selectedSide) {
      skipQuestion();
      return true;
    }

    // Post-result: any swipe advances (don't wait for showNext)
    if (showResult) {
      setShowNext(false);
      nextQuestion();
      return true;
    }

    // Mid-selection (tapped A/B but result animation not ready yet):
    // ignore — let the result render first.
    return false;
  }, [displayQuestion, nextQuestion, selectedSide, showResult, skipQuestion]);

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = touchStartRef.current;
    if (!start) return;
    touchStartRef.current = null;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    const isVerticalSwipe = Math.abs(deltaY) > 72 && Math.abs(deltaY) > Math.abs(deltaX) * 1.2;
    const isSwipeUp = deltaY < 0;

    if (isVerticalSwipe && isSwipeUp) {
      advanceFeed();
    }
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    // Allow wheel advance any time there's something to advance to.
    // (Previously blocked during post-selection pending state; that made
    // the feed feel unresponsive after tapping A/B.)
    if (event.deltaY < 48) return;

    const now = Date.now();
    if (now - lastWheelAdvanceRef.current < 350) return;

    lastWheelAdvanceRef.current = now;
    advanceFeed();
  }

  if (!mounted) return null;

  if (allDone) {
    return (
      <div className="round-canvas round-shell items-center justify-center px-6">
        <div className="round-panel-strong w-full max-w-sm rounded-[34px] px-6 py-10 text-center">
          <p className="text-5xl">✨</p>
          <h2 className="mt-5 text-2xl font-black tracking-[-0.04em] text-white">
            모든 질문을 봤어요
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/56">
            {totalAnswered}개의 선택이 쌓였어요. DNA를 확인해보세요.
          </p>
          <button
            type="button"
            onClick={handleOpenDNA}
            className="mt-7 inline-flex min-h-12 items-center justify-center rounded-[22px] bg-white px-6 py-3.5 text-sm font-bold leading-none text-slate-900"
          >
            내 Choice DNA 보러가기 →
          </button>
        </div>
      </div>
    );
  }

  if (!displayQuestion || !currentQuestion) return null;

  return (
    <div className="round-canvas round-shell">
      <header className="relative z-10 flex items-center justify-between px-4 pb-1.5 pt-safe-top">
        <p className="round-mono text-sm font-bold text-white/90">Round</p>
        {isTossEnv ? (
          <button
            type="button"
            onClick={handleOpenDNA}
            className="round-mono inline-flex h-7 items-center gap-1 rounded-full border border-white/12 bg-white/5 px-2.5 text-[11px] font-medium text-white/60"
          >
            🧬 DNA
          </button>
        ) : (
          <a
            href="/dna"
            className="round-mono inline-flex h-7 items-center gap-1 rounded-full border border-white/12 bg-white/5 px-2.5 text-[11px] font-medium text-white/60"
          >
            🧬 DNA
          </a>
        )}
      </header>

      <main
        className="no-scrollbar relative z-10 flex flex-1 flex-col overflow-y-auto px-4 pb-24"
        style={{ scrollSnapType: "y mandatory" }}
      >
        <div
          key={displayQuestion.id}
          className="animate-feedSlide flex min-h-full flex-col justify-center"
          style={{ scrollSnapAlign: "start", scrollSnapStop: "always" }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
          <QuestionFeedCard
            question={displayQuestion}
            onChoose={handleChoice}
            onSkip={skipQuestion}
            disabled={!!selectedSide}
            selectedSide={selectedSide}
            isPending={!!selectedSide && !showResult}
            showResult={showResult}
            pctA={liveResult.pctA}
            pctB={liveResult.pctB}
            totalVotes={liveResult.totalVotes}
            bestSame={bestSame}
            bestOpposite={bestOpposite}
            allReasons={allReasons}
            onHeart={heartReason}
            onReasonSubmit={(text) => {
              addReason(text);
              if (selectedSide) prependLocalReason(selectedSide, text);
            }}
            showNext={showNext}
            onNext={() => { setShowNext(false); nextQuestion(); }}
          />
        </div>
      </main>
    </div>
  );
}

"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { UserChoice, Question, QuestionLocale, QuestionMetricsSnapshot } from "@/lib/types";
import { getQuestionsForLocale } from "@/data/questions";
import { getQuestionOpsMetrics } from "@/utils/questionOps";
import { getActiveFeedQuestions } from "@/utils/feedSelection";
import { getQuestionMetricsBatch } from "@/lib/questionMetrics";
import { getApprovedQuestionCandidates } from "@/lib/questionCandidates";
import { trackEvent, getDeviceId } from "@/utils/analytics";
import { saveVote } from "@/lib/votes";
import { saveReason } from "@/lib/reasons";
import { getChoicesStorageKey, migrateChoicesStorage } from "@/lib/constants";

// Run migration once on first import (moves legacy key → ko-KR scoped)
if (typeof window !== "undefined") migrateChoicesStorage();

function loadChoices(locale: string = "ko-KR"): UserChoice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getChoicesStorageKey(locale));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistChoices(choices: UserChoice[], locale: string = "ko-KR") {
  localStorage.setItem(getChoicesStorageKey(locale), JSON.stringify(choices));
}

/**
 * Fallback feed (no metrics yet): starter fixed → feed shuffled.
 */
function mergeFeedQuestions(baseFeed: Question[], dynamicQuestions: Question[] = []): Question[] {
  const seen = new Set<string>();
  return [...baseFeed, ...dynamicQuestions].filter((q) => {
    if (seen.has(q.id)) return false;
    seen.add(q.id);
    return true;
  });
}

function buildFallbackSequence(
  starter: Question[],
  baseFeed: Question[],
  dynamicQuestions: Question[] = [],
): Question[] {
  const shuffled = [...mergeFeedQuestions(baseFeed, dynamicQuestions)].sort(() => Math.random() - 0.5);
  return [...starter, ...shuffled];
}

/**
 * Status-aware feed: starter fixed → feed sorted by status policy.
 */
function buildStatusAwareSequence(
  starter: Question[],
  feedQuestions: Question[],
  metricsMap: Map<string, QuestionMetricsSnapshot>,
): Question[] {
  const activeFeed = getActiveFeedQuestions(feedQuestions, metricsMap);
  return [...starter, ...activeFeed];
}

export function useChoiceState(locale?: QuestionLocale, deepLinkQuestionId?: string | null) {
  const resolvedLocale = locale ?? "ko-KR";
  const bundle = useMemo(() => getQuestionsForLocale(locale), [locale]);
  const [choices, setChoices] = useState<UserChoice[]>(() => loadChoices(resolvedLocale));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSide, setSelectedSide] = useState<"A" | "B" | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [resultQuestion, setResultQuestion] = useState<Question | null>(null);
  // Skipped question ids — rotated to the end of the unanswered feed
  const [skippedIds, setSkippedIds] = useState<string[]>([]);

  // Start with fallback — shuffle ONCE and keep the order stable.
  // The initial sequence is stored in a ref so subsequent effects
  // can upgrade the feed portion without re-shuffling starter order.
  const [allQuestions, setAllQuestions] = useState<Question[]>(() =>
    buildFallbackSequence(bundle.starter, bundle.feed),
  );

  // Track the last bundle identity so we only rebuild on real locale changes
  const lastBundleRef = useRef(bundle);

  // Rebuild ONLY when the locale actually changes (not on every render)
  useEffect(() => {
    if (lastBundleRef.current === bundle) return;
    lastBundleRef.current = bundle;
    setAllQuestions(buildFallbackSequence(bundle.starter, bundle.feed));
  }, [bundle]);

  // Load approved candidates + metrics once on mount.
  // Uses a flag ref so it never re-runs and re-shuffles.
  const hasLoadedRef = useRef(false);
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    let cancelled = false;
    void (async () => {
      try {
        const approved = await getApprovedQuestionCandidates();
        const mergedFeed = mergeFeedQuestions(bundle.feed, approved);

        const ids = mergedFeed.map((q) => q.id);
        const metricsMap = await getQuestionMetricsBatch(ids);

        if (!cancelled) {
          let nextList: Question[] | null = null;

          if (metricsMap.size > 0) {
            nextList = buildStatusAwareSequence(bundle.starter, mergedFeed, metricsMap);
          } else if (approved.length > 0) {
            nextList = buildFallbackSequence(bundle.starter, bundle.feed, approved);
          }

          if (nextList) {
            // Preserve the question the user is currently looking at
            // so the feed doesn't visibly jump.
            setAllQuestions((prev) => {
              const currentId = prev.find((q, i) => {
                // Find the first unanswered question (approximation —
                // answeredIds is not available here, but starter[0] is
                // always the first question for a new user)
                return i === 0;
              })?.id;

              if (!currentId) return nextList;

              // If the current question is still in the new list,
              // move it to index 0 so the user doesn't see a jump
              const idx = nextList.findIndex((q) => q.id === currentId);
              if (idx > 0) {
                return [nextList[idx], ...nextList.slice(0, idx), ...nextList.slice(idx + 1)];
              }
              return nextList;
            });
          }
        }
      } catch {
        // Keep fallback
      }
    })();

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const answeredIds = useMemo(
    () => new Set(choices.map((c) => c.questionId)),
    [choices],
  );

  const unanswered = useMemo(() => {
    const pool = allQuestions.filter((q) => !answeredIds.has(q.id));

    // Deep-link: surface the requested question at the front (one-time)
    let ordered = pool;
    if (deepLinkQuestionId) {
      const dlIdx = pool.findIndex((q) => q.id === deepLinkQuestionId);
      if (dlIdx > 0) {
        // Move it to position 0 without disrupting the rest
        ordered = [pool[dlIdx], ...pool.slice(0, dlIdx), ...pool.slice(dlIdx + 1)];
      }
      // dlIdx === 0 → already first; dlIdx === -1 → not in pool, ignore
    }

    if (skippedIds.length === 0) return ordered;
    // Rotate skipped questions to the end (preserving skip order)
    const skippedSet = new Set(skippedIds);
    const nonSkipped = ordered.filter((q) => !skippedSet.has(q.id));
    const skipped = skippedIds
      .map((id) => ordered.find((q) => q.id === id))
      .filter((q): q is Question => !!q);
    return [...nonSkipped, ...skipped];
  }, [allQuestions, answeredIds, skippedIds, deepLinkQuestionId]);

  const allDone = unanswered.length === 0;
  const currentQuestion = allDone ? null : unanswered[currentIndex % unanswered.length];
  const activeQuestion = showResult ? resultQuestion : currentQuestion;

  // Dev: log current question ops
  if (process.env.NODE_ENV === "development" && currentQuestion) {
    const ops = getQuestionOpsMetrics(currentQuestion);
    console.log(`[Round Q] ${currentQuestion.id} | split ${ops.splitScore} (${ops.splitGrade}) | ${ops.topic}/${ops.tension}`);
  }

  const choose = useCallback(
    (side: "A" | "B") => {
      if (!currentQuestion || selectedSide) return;

      const choice: UserChoice = {
        questionId: currentQuestion.id,
        side,
        category: currentQuestion.category,
        chosenAt: new Date(),
      };

      const updated = [...choices.filter((c) => c.questionId !== currentQuestion.id), choice];
      setChoices(updated);
      persistChoices(updated, resolvedLocale);
      setResultQuestion(currentQuestion);
      setSelectedSide(side);
      setTimeout(() => setShowResult(true), 300);

      saveVote({
        question_id: currentQuestion.id,
        device_id: getDeviceId(),
        side,
      });

      trackEvent("choice_made", { questionId: currentQuestion.id, side });
    },
    [currentQuestion, choices, selectedSide],
  );

  const nextQuestion = useCallback(() => {
    trackEvent("next_card_clicked", { questionId: activeQuestion?.id });
    setSelectedSide(null);
    setShowResult(false);
    setResultQuestion(null);
    setCurrentIndex(0);
  }, [activeQuestion]);

  /**
   * Skip the current question without answering.
   * - does not require login
   * - does not set selectedSide
   * - does not create a vote or reason
   * - does not mark the question as answered
   * - rotates the question to the end of the unanswered feed
   */
  const skipQuestion = useCallback(() => {
    if (!currentQuestion || selectedSide) return;

    trackEvent("question_skipped", {
      questionId: currentQuestion.id,
      category: currentQuestion.category,
      reason: "manual_skip",
    });

    // Defensive reset so skip always returns to a clean pre-answer state.
    setSelectedSide(null);
    setShowResult(false);
    setResultQuestion(null);

    setSkippedIds((prev) => {
      // Remove if already in queue, then push to end
      const filtered = prev.filter((id) => id !== currentQuestion.id);
      return [...filtered, currentQuestion.id];
    });
    setCurrentIndex(0);
  }, [currentQuestion, selectedSide]);

  const addReason = useCallback(
    (text: string) => {
      const targetQuestion = resultQuestion ?? currentQuestion;
      if (!targetQuestion || !selectedSide) return;

      const updated = choices.map((c) =>
        c.questionId === targetQuestion.id ? { ...c, reason: text } : c,
      );
      setChoices(updated);
      persistChoices(updated, resolvedLocale);

      saveReason({
        question_id: targetQuestion.id,
        device_id: getDeviceId(),
        side: selectedSide,
        text,
      });

      trackEvent("reason_written", {
        questionId: targetQuestion.id,
        textLength: text.length,
      });
    },
    [currentQuestion, resultQuestion, choices, selectedSide],
  );

  return {
    currentQuestion,
    resultQuestion,
    currentIndex,
    selectedSide,
    showResult,
    choices,
    totalAnswered: choices.length,
    totalQuestions: allQuestions.length,
    allDone,
    choose,
    nextQuestion,
    skipQuestion,
    addReason,
  };
}

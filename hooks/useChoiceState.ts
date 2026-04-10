"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import type { UserChoice, Question, QuestionMetricsSnapshot } from "@/lib/types";
import { STARTER_QUESTIONS, FEED_QUESTIONS } from "@/data/questions";
import { getQuestionOpsMetrics } from "@/utils/questionOps";
import { getActiveFeedQuestions } from "@/utils/feedSelection";
import { getQuestionMetricsBatch } from "@/lib/questionMetrics";
import { trackEvent, getDeviceId } from "@/utils/analytics";
import { saveVote } from "@/lib/votes";
import { saveReason } from "@/lib/reasons";
import { STORAGE_KEY_CHOICES } from "@/lib/constants";

function loadChoices(): UserChoice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHOICES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistChoices(choices: UserChoice[]) {
  localStorage.setItem(STORAGE_KEY_CHOICES, JSON.stringify(choices));
}

/**
 * Fallback feed (no metrics yet): starter fixed → feed shuffled.
 */
function buildFallbackSequence(): Question[] {
  const shuffled = [...FEED_QUESTIONS].sort(() => Math.random() - 0.5);
  return [...STARTER_QUESTIONS, ...shuffled];
}

/**
 * Status-aware feed: starter fixed → feed sorted by status policy.
 */
function buildStatusAwareSequence(metricsMap: Map<string, QuestionMetricsSnapshot>): Question[] {
  const activeFeed = getActiveFeedQuestions(FEED_QUESTIONS, metricsMap);
  return [...STARTER_QUESTIONS, ...activeFeed];
}

export function useChoiceState() {
  const [choices, setChoices] = useState<UserChoice[]>(() => loadChoices());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSide, setSelectedSide] = useState<"A" | "B" | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [resultQuestion, setResultQuestion] = useState<Question | null>(null);
  // Skipped question ids — rotated to the end of the unanswered feed
  const [skippedIds, setSkippedIds] = useState<string[]>([]);

  // Start with fallback, upgrade when metrics arrive
  const [allQuestions, setAllQuestions] = useState<Question[]>(buildFallbackSequence);

  // Load metrics once on mount, then rebuild feed
  useEffect(() => {
    const ids = FEED_QUESTIONS.map((q) => q.id);
    getQuestionMetricsBatch(ids).then((metricsMap) => {
      if (metricsMap.size > 0) {
        setAllQuestions(buildStatusAwareSequence(metricsMap));
      }
    }).catch(() => {
      // Metrics unavailable — keep fallback
    });
  }, []);

  const answeredIds = useMemo(
    () => new Set(choices.map((c) => c.questionId)),
    [choices],
  );

  const unanswered = useMemo(() => {
    const pool = allQuestions.filter((q) => !answeredIds.has(q.id));
    if (skippedIds.length === 0) return pool;
    // Rotate skipped questions to the end (preserving skip order)
    const skippedSet = new Set(skippedIds);
    const nonSkipped = pool.filter((q) => !skippedSet.has(q.id));
    const skipped = skippedIds
      .map((id) => pool.find((q) => q.id === id))
      .filter((q): q is Question => !!q);
    return [...nonSkipped, ...skipped];
  }, [allQuestions, answeredIds, skippedIds]);

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
      persistChoices(updated);
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
      persistChoices(updated);

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

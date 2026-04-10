"use client";

import { useMemo, useState, useEffect } from "react";
import { getQuestionResult, type QuestionResult } from "@/lib/results";

interface ResultData {
  pctA: number;
  pctB: number;
  totalVotes: number;
  isLive: boolean;
}

interface LiveEntry {
  questionId: string;
  data: QuestionResult;
}

export function useQuestionResult(
  questionId: string | undefined,
  seedA: number,
  seedB: number,
  seedTotal: number,
  active: boolean,
): ResultData {
  const [liveEntry, setLiveEntry] = useState<LiveEntry | null>(null);

  useEffect(() => {
    if (!active || !questionId) return;

    let cancelled = false;

    getQuestionResult(questionId).then((result) => {
      if (cancelled || !result || result.totalVotes === 0) return;
      setLiveEntry({ questionId, data: result });
    });

    return () => { cancelled = true; };
  }, [questionId, active]);

  // liveEntry가 현재 questionId와 일치할 때만 사용
  return useMemo<ResultData>(() => {
    if (liveEntry && liveEntry.questionId === questionId) {
      const d = liveEntry.data;
      return { pctA: d.pctA, pctB: d.pctB, totalVotes: d.totalVotes, isLive: true };
    }
    return { pctA: seedA, pctB: seedB, totalVotes: seedTotal, isLive: false };
  }, [liveEntry, questionId, seedA, seedB, seedTotal]);
}

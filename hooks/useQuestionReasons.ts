"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import type { Reason } from "@/lib/types";
import { fetchReasons } from "@/lib/reasons";

interface DbEntry { questionId: string; reasons: Reason[] }
interface LocalEntry { questionId: string; reasons: Reason[] }

function dedupeReasons(reasons: Reason[]) {
  const seen = new Set<string>();
  return reasons.filter((r) => {
    const key = `${r.side}:${r.text.trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function bestBySide(reasons: Reason[], side: "A" | "B"): Reason | null {
  const filtered = reasons.filter((r) => r.side === side);
  if (filtered.length === 0) return null;
  return filtered.sort((a, b) => b.likes - a.likes)[0];
}

export function useQuestionReasons(
  questionId: string | undefined,
  _seedReasons: Reason[],
  active: boolean,
  selectedSide: "A" | "B" | null,
) {
  const [dbEntry, setDbEntry] = useState<DbEntry | null>(null);
  const [localEntry, setLocalEntry] = useState<LocalEntry | null>(null);

  useEffect(() => {
    if (!active || !questionId) return;
    let cancelled = false;
    fetchReasons(questionId, 20).then((fetched) => {
      if (!cancelled) setDbEntry({ questionId, reasons: fetched });
    });
    return () => { cancelled = true; };
  }, [questionId, active]);

  const allReasons = useMemo(() => {
    const db = dbEntry && dbEntry.questionId === questionId ? dbEntry.reasons : [];
    const local = localEntry && localEntry.questionId === questionId ? localEntry.reasons : [];
    return dedupeReasons([...local, ...db]);
  }, [dbEntry, localEntry, questionId]);

  const oppositeSide = selectedSide === "A" ? "B" : "A";

  const bestSame = useMemo(
    () => (selectedSide ? bestBySide(allReasons, selectedSide) : null),
    [allReasons, selectedSide],
  );
  const bestOpposite = useMemo(
    () => (selectedSide ? bestBySide(allReasons, oppositeSide) : null),
    [allReasons, oppositeSide, selectedSide],
  );

  const prependLocalReason = useCallback(
    (side: "A" | "B", text: string) => {
      if (!questionId) return;
      setLocalEntry((prev) => {
        const prevReasons = prev?.questionId === questionId ? prev.reasons : [];
        if (prevReasons.some((r) => r.text === text)) return prev;
        return {
          questionId,
          reasons: [{ side, text, likes: 0, likedByMe: false }, ...prevReasons],
        };
      });
    },
    [questionId],
  );

  return { bestSame, bestOpposite, allReasons, prependLocalReason };
}

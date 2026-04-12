"use client";

import { useMemo } from "react";
import type { QuestionLocale, UserChoice } from "@/lib/types";
import { calculateDNA, getDNAProgressMessage } from "@/utils/dnaCalculator";

export function useDNA(choices: UserChoice[], locale?: QuestionLocale | string | null) {
  const dna = useMemo(() => calculateDNA(choices), [choices]);

  const progressMessage = useMemo(
    () => getDNAProgressMessage(dna.totalChoices, dna.archetype, locale),
    [dna.totalChoices, dna.archetype, locale],
  );

  return { dna, progressMessage };
}

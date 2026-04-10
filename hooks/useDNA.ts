"use client";

import { useMemo } from "react";
import type { UserChoice } from "@/lib/types";
import { calculateDNA, getDNAProgressMessage } from "@/utils/dnaCalculator";

export function useDNA(choices: UserChoice[]) {
  const dna = useMemo(() => calculateDNA(choices), [choices]);

  const progressMessage = useMemo(
    () => getDNAProgressMessage(dna.totalChoices, dna.archetype),
    [dna.totalChoices, dna.archetype],
  );

  return { dna, progressMessage };
}

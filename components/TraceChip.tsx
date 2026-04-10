"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { UserChoice } from "@/lib/types";
import { computeTodayTrace } from "@/lib/userActivity";

interface Props {
  choices: UserChoice[];
  isTossEnv: boolean;
  onBeforeNavigate?: () => Promise<boolean> | boolean;
}

const EMOJI_BY_CATEGORY: Record<string, string> = {
  음식: "🍜",
  커리어: "💼",
  관계: "💕",
  소비: "💸",
  라이프: "🌿",
  여행: "✈️",
  트렌드: "🔥",
};

/**
 * Tiny "오늘 기록" pill that lives next to the DNA pill in the feed
 * top bar. Hidden when the user has no trace today — no lies, no
 * "0개" guilt trip.
 *
 * Tap → /dna (awaits optional guard, e.g. Toss login).
 */
export default function TraceChip({ choices, isTossEnv, onBeforeNavigate }: Props) {
  const router = useRouter();
  const trace = computeTodayTrace(choices);

  if (trace.count === 0) return null;

  const emoji =
    (trace.topCategory && EMOJI_BY_CATEGORY[trace.topCategory.category]) || "✨";

  const label =
    trace.count < 3 || !trace.topCategory
      ? `오늘 ${trace.count}개`
      : `${emoji} 오늘 ${trace.count}개`;

  const handleClick = async () => {
    if (onBeforeNavigate) {
      const ok = await onBeforeNavigate();
      if (!ok) return;
    }
    router.push("/dna");
  };

  const content = (
    <motion.span
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="round-mono inline-flex h-8 items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] px-3 text-[11px] font-semibold text-white/75 backdrop-blur"
    >
      {label}
    </motion.span>
  );

  if (isTossEnv) {
    return (
      <button type="button" onClick={handleClick} className="pointer-events-auto">
        {content}
      </button>
    );
  }

  return (
    <a href="/dna" className="pointer-events-auto">
      {content}
    </a>
  );
}

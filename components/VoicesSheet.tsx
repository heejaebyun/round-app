"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import type { QuestionLocale, Reason } from "@/lib/types";
import ReasonList from "./ReasonList";
import ReasonInput from "./ReasonInput";
import { isEnglishLocale } from "@/lib/i18n";

interface Props {
  open: boolean;
  onClose: () => void;
  bestSame: Reason | null;
  bestOpposite: Reason | null;
  allReasons: Reason[];
  categoryColor: string;
  selectedSide: "A" | "B";
  optionALabel: string;
  optionBLabel: string;
  onHeart?: (reasonId: string) => Promise<{ ok: boolean; alreadyLiked?: boolean }>;
  onReasonSubmit: (text: string) => void;
  locale?: QuestionLocale;
}

/**
 * Bottom sheet showing the full Voices list.
 * Opens to 70% viewport, drag up → fullscreen, drag down → dismiss.
 */
export default function VoicesSheet({
  open,
  onClose,
  bestSame,
  bestOpposite,
  allReasons,
  categoryColor,
  selectedSide,
  optionALabel,
  optionBLabel,
  onHeart,
  onReasonSubmit,
  locale,
}: Props) {
  const isEn = isEnglishLocale(locale);
  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Body scroll lock while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handleDragEnd = (_e: unknown, info: PanInfo) => {
    // swipe down → close
    if (info.offset.y > 120 || info.velocity.y > 500) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center"
          initial={{ backgroundColor: "rgba(0,0,0,0)" }}
          animate={{ backgroundColor: "rgba(0,0,0,0.55)" }}
          exit={{ backgroundColor: "rgba(0,0,0,0)" }}
          transition={{ duration: 0.2 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            className="relative w-full max-w-[420px] overflow-hidden rounded-t-[28px] border-t border-white/10 bg-[#0b0d14]"
            style={{ height: "72dvh" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.02, bottom: 0.3 }}
            onDragEnd={handleDragEnd}
          >
            {/* drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-white/15" />
            </div>

            {/* header */}
            <div className="flex items-center justify-between px-5 pb-2">
              <h3 className="text-[15px] font-black tracking-tight text-white">
                {isEn ? "Voices" : "의견"} <span className="round-mono text-white/40">{allReasons.length}</span>
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-white/40 hover:text-white/70"
              >
                {isEn ? "Close" : "닫기"}
              </button>
            </div>

            {/* content scroll area */}
            <div className="no-scrollbar h-[calc(72dvh-132px)] overflow-y-auto px-4 pb-4">
              <ReasonList
                bestSame={bestSame}
                bestOpposite={bestOpposite}
                allReasons={allReasons}
                categoryColor={categoryColor}
                selectedSide={selectedSide}
                optionALabel={optionALabel}
                optionBLabel={optionBLabel}
                onHeart={onHeart}
                embedded
                locale={locale}
              />
            </div>

            {/* footer input */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-white/8 bg-[#0b0d14]/95 px-4 py-3 pb-safe-bottom">
              <ReasonInput onSubmit={onReasonSubmit} locale={locale} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

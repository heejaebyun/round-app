"use client";

import { useState } from "react";

interface Props {
  onSubmit: (text: string) => void;
}

export default function ReasonInput({ onSubmit }: Props) {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!text.trim() || submitted) return;
    onSubmit(text.trim());
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="px-1">
        <div className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-4 py-2.5 text-center text-xs text-emerald-300/80">
          ✓ 등록됨
        </div>
      </div>
    );
  }

  return (
    <div className="px-1">
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
        <span className="text-sm text-white/30">💬</span>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 50))}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="한마디 남기기..."
          className="min-w-0 flex-1 bg-transparent text-sm text-white/80 placeholder-white/25 outline-none"
        />
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="shrink-0 text-sm font-bold text-white/50 transition hover:text-white/80 disabled:opacity-30"
        >
          →
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";

export default function EmailContact() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SITE.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API 실패 시 무시 — 텍스트는 이미 보임
    }
  };

  return (
    <span className="inline-flex items-center gap-2">
      <span className="select-all text-cyan-400">{SITE.email}</span>
      <button
        type="button"
        onClick={handleCopy}
        className="rounded-md border border-white/10 px-2 py-0.5 text-[11px] text-white/40 transition hover:text-white/60 active:scale-95"
      >
        {copied ? "복사됨" : "복사"}
      </button>
    </span>
  );
}

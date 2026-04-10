"use client";

interface Props {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: Props) {
  const pct = total > 0 ? Math.min((current / total) * 100, 100) : 0;

  return (
    <div className="rounded-full border border-white/8 bg-white/[0.04] px-1 py-1">
      <div className="mb-2 flex items-center justify-between px-2 pt-1">
        <span className="round-mono text-[10px] uppercase tracking-[0.26em] text-white/30">
          진행
        </span>
        <span className="round-mono text-[11px] text-white/44">
          {current}/{total}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

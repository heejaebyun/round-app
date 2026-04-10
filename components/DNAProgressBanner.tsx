"use client";

interface Props {
  message: string;
  total: number;
}

export default function DNAProgressBanner({ message, total }: Props) {
  if (!message || total === 0) return null;

  return (
    <div className="animate-fadeUp px-1">
      <div className="rounded-[28px] border border-cyan-300/18 bg-cyan-300/[0.08] px-4 py-4 text-center">
        <p className="round-mono text-[11px] uppercase tracking-[0.28em] text-cyan-200/55">
          DNA 변화
        </p>
        <p className="mt-2 text-sm leading-6 text-cyan-100/84">{message}</p>
      </div>
    </div>
  );
}

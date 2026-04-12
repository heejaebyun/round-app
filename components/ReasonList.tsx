"use client";

import { useMemo, useState } from "react";
import type { QuestionLocale, Reason } from "@/lib/types";
import ReasonCard from "./ReasonCard";
import { isEnglishLocale } from "@/lib/i18n";

type SortKey = "likes" | "recent";
type FilterKey = "all" | "same" | "opposite";

interface Props {
  bestSame: Reason | null;
  bestOpposite: Reason | null;
  allReasons: Reason[];
  categoryColor: string;
  selectedSide: "A" | "B";
  optionALabel: string;
  optionBLabel: string;
  onHeart?: (reasonId: string) => Promise<{ ok: boolean; alreadyLiked?: boolean }>;
  embedded?: boolean; // true = 외부 카드 안에 포함됨, 자체 패널 제거
  locale?: QuestionLocale;
}

export default function ReasonList({
  bestSame, bestOpposite, allReasons, categoryColor,
  selectedSide, optionALabel, optionBLabel, onHeart, embedded, locale,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [sort, setSort] = useState<SortKey>("likes");
  const [filter, setFilter] = useState<FilterKey>("all");

  const hasBest = bestSame || bestOpposite;
  const oppositeSide = selectedSide === "A" ? "B" : "A";
  const sideLabel = (side: "A" | "B") => side === "A" ? optionALabel : optionBLabel;
  const isEn = isEnglishLocale(locale);

  const filtered = useMemo(() => {
    let list = allReasons;
    if (filter === "same") list = list.filter((r) => r.side === selectedSide);
    if (filter === "opposite") list = list.filter((r) => r.side === oppositeSide);
    if (sort === "likes") list = [...list].sort((a, b) => b.likes - a.likes);
    // "recent"은 이미 최신순 (fetch 순서)
    return list;
  }, [allReasons, filter, sort, selectedSide, oppositeSide]);

  const sameSideCount = allReasons.filter((r) => r.side === selectedSide).length;
  const oppositeSideCount = allReasons.filter((r) => r.side === oppositeSide).length;

  const Wrapper = embedded ? "div" : "section";
  const innerCls = embedded ? "" : "round-panel rounded-[30px] px-5 py-5";

  return (
    <Wrapper className={embedded ? "" : "px-1"}>
      <div className={innerCls}>
        <p className="round-mono text-[11px] uppercase tracking-[0.26em] text-white/35">Voices</p>

        {/* 요약: 베스트 2개 */}
        {!expanded && (
          <>
            {!hasBest ? (
              <EmptyAll locale={locale} />
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                {bestSame ? (
                  <BestSection label={isEn ? "People who picked the same side" : "같은 선택을 한 사람"} reason={bestSame} sideLabel={sideLabel(bestSame.side)} color={categoryColor} selectedOptionId={selectedSide} onHeart={onHeart} locale={locale} />
                ) : (
                  <EmptySide label={isEn ? "My pick" : "내 선택"} prompt={isEn ? "Leave a quick line about why you picked this" : "왜 이렇게 골랐는지 한 줄 남겨보세요"} />
                )}
                {bestOpposite ? (
                  <BestSection label={isEn ? "Here's how the other side sees it" : "반대쪽은 이렇게 봤어요"} reason={bestOpposite} sideLabel={sideLabel(bestOpposite.side)} color={categoryColor} selectedOptionId={selectedSide} onHeart={onHeart} locale={locale} />
                ) : (
                  <EmptySide label={isEn ? "Opposite side" : "반대 선택"} prompt={isEn ? "No opposite-side voice yet. Be the first to add one" : "아직 반대편 의견이 비어 있어요. 첫 반론을 남겨보세요"} />
                )}
              </div>
            )}
            {allReasons.length > 2 && (
              <button
                onClick={() => setExpanded(true)}
                className="mt-4 w-full rounded-[18px] border border-white/8 py-2.5 text-center text-xs font-semibold text-white/50 transition hover:text-white/70"
              >
                {isEn ? `See all ${allReasons.length} voices` : `의견 ${allReasons.length}개 전체 보기`}
              </button>
            )}
          </>
        )}

        {/* 전체 보기 모드 */}
        {expanded && (
          <div className="mt-4">
            {/* 헤더 + 접기 */}
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white/80">
                {isEn ? "All voices" : "전체 의견"} <span className="round-mono text-white/40">{allReasons.length}</span>
              </h3>
              <button onClick={() => setExpanded(false)} className="text-xs text-white/40 hover:text-white/60">
                {isEn ? "Collapse" : "접기"}
              </button>
            </div>

            {/* 필터 + 정렬 */}
            <div className="mb-4 flex items-center gap-2">
              <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label={isEn ? "All" : "전체"} />
              <FilterChip active={filter === "same"} onClick={() => setFilter("same")} label={`${sideLabel(selectedSide)} (${sameSideCount})`} />
              <FilterChip active={filter === "opposite"} onClick={() => setFilter("opposite")} label={`${sideLabel(oppositeSide)} (${oppositeSideCount})`} />
              <div className="ml-auto" />
              <SortChip active={sort === "likes"} onClick={() => setSort("likes")} label={isEn ? "Top liked" : "공감순"} />
              <SortChip active={sort === "recent"} onClick={() => setSort("recent")} label={isEn ? "Recent" : "최신순"} />
            </div>

            {/* 리스트 */}
            <div className="flex flex-col gap-2">
              {filtered.length === 0 ? (
                <div className="rounded-[18px] border border-dashed border-white/10 px-4 py-4 text-center text-xs text-white/40">
                  {filter === "opposite"
                    ? (isEn ? "No opposite-side voice yet. Be the first to add one" : "아직 반대편 의견이 없어요. 첫 반론을 남겨보세요")
                    : (isEn ? "No voices match this filter yet" : "이 필터에 해당하는 의견이 아직 없어요")}
                </div>
              ) : (
                filtered.map((r, i) => (
                  <ReasonCard
                    key={r.id ?? `${r.side}-${i}`}
                    reason={r}
                    sideLabel={sideLabel(r.side)}
                    color={categoryColor}
                    selectedOptionId={selectedSide}
                    optionALabel={optionALabel}
                    optionBLabel={optionBLabel}
                    onHeart={onHeart}
                    delay={i * 40}
                    showReplies
                    locale={locale}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </Wrapper>
  );
}

function BestSection({ label, reason, sideLabel, color, selectedOptionId, onHeart, locale }: {
  label: string; reason: Reason; sideLabel: string; color: string; selectedOptionId: string;
  onHeart?: (id: string) => Promise<{ ok: boolean; alreadyLiked?: boolean }>;
  locale?: QuestionLocale;
}) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold text-white/45">{label}</p>
      <ReasonCard reason={reason} sideLabel={sideLabel} color={color} selectedOptionId={selectedOptionId} onHeart={onHeart} locale={locale} />
    </div>
  );
}

function EmptyAll({ locale }: { locale?: QuestionLocale }) {
  const isEn = isEnglishLocale(locale);
  return (
    <div className="mt-4 rounded-[22px] border border-dashed border-white/10 bg-white/[0.02] px-4 py-5 text-center">
      <p className="text-sm font-semibold text-white/70">
        {isEn ? "Leave a quick line about why you picked this" : "왜 이렇게 골랐는지 한 줄 남겨보세요"}
      </p>
      <p className="mt-1 text-xs text-white/40">
        {isEn ? "Your line could change the next person's choice" : "당신의 한 줄이 다음 사람의 선택을 바꿀 수 있어요"}
      </p>
    </div>
  );
}

function EmptySide({ label, prompt }: { label: string; prompt: string }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold text-white/45">{label}</p>
      <div className="rounded-[18px] border border-dashed border-white/8 px-4 py-3 text-center text-xs text-white/40">
        {prompt}
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
        active ? "bg-white/15 text-white/80" : "text-white/35 hover:text-white/55"
      }`}
    >
      {label}
    </button>
  );
}

function SortChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`round-mono rounded-full px-2 py-1 text-[10px] transition ${
        active ? "text-white/60" : "text-white/25 hover:text-white/45"
      }`}
    >
      {label}
    </button>
  );
}

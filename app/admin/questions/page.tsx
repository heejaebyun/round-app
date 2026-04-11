"use client";

import { useEffect, useMemo, useState } from "react";
import { SNACK_TAGS } from "@/lib/types";
import type {
  AdminReplyItem,
  Category,
  QuestionCandidate,
  QuestionCandidateInsert,
  QuestionStatus,
  QuestionTension,
  QuestionTopic,
} from "@/lib/types";

const CATEGORIES: Category[] = ["관계", "소비", "커리어", "라이프", "음식", "여행", "트렌드"];
const TOPICS: QuestionTopic[] = ["relationship", "money", "manners", "work", "family", "self", "lifestyle", "society"];
const TENSIONS: QuestionTension[] = [
  "care_vs_principle",
  "present_vs_future",
  "freedom_vs_responsibility",
  "stability_vs_growth",
  "privacy_vs_openness",
  "efficiency_vs_empathy",
  "honesty_vs_harmony",
  "fairness_vs_generosity",
];

interface InspectQuestionItem {
  id: string;
  question: string;
  topic: QuestionTopic | null;
  tension: QuestionTension | null;
  splitGrade: "S" | "A" | "B" | "C";
  splitScore: number;
  heatScore: number;
  longevityScore: number;
  voteCount: number;
  reasonCtr: number;
  derivedStatus: QuestionStatus;
  feedbackTotal: number;
  feedbackByReason: Record<string, number> | null;
}

interface InspectSummary {
  total: number;
  statusCounts: Partial<Record<QuestionStatus, number>>;
  questions: InspectQuestionItem[];
}

const EMPTY_FORM: QuestionCandidateInsert = {
  question: "",
  category: "관계",
  optionA: "",
  optionB: "",
  valueA: "현실파",
  valueB: "예의파",
  topic: "relationship",
  tension: "care_vs_principle",
  sourceType: "manual_editorial",
  locale: "ko-KR",
};

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

function getStatusTone(status: QuestionStatus) {
  switch (status) {
    case "rising":
      return "bg-cyan-300/20 text-cyan-200 border-cyan-300/25";
    case "evergreen":
      return "bg-emerald-300/20 text-emerald-200 border-emerald-300/25";
    case "archive":
      return "bg-red-300/15 text-red-200 border-red-300/25";
    default:
      return "bg-white/[0.05] text-white/65 border-white/10";
  }
}

export default function AdminQuestionsPage() {
  const [emailInput, setEmailInput] = useState("");
  const [authed, setAuthed] = useState<boolean | null>(null); // null = unknown, false = locked out, true = logged in
  const [pending, setPending] = useState<QuestionCandidate[]>([]);
  const [approved, setApproved] = useState<QuestionCandidate[]>([]);
  const [opsSummary, setOpsSummary] = useState<InspectSummary | null>(null);
  const [recentReplies, setRecentReplies] = useState<AdminReplyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState<QuestionCandidateInsert>(EMPTY_FORM);

  // Check existing session on mount
  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/me", { credentials: "include" });
        const json = (await res.json()) as { authenticated?: boolean };
        setAuthed(!!json.authenticated);
      } catch {
        setAuthed(false);
      }
    })();
  }, []);

  const authHeaders = useMemo<HeadersInit>(
    () => new Headers({ "Content-Type": "application/json" }),
    [],
  );

  const topQuestions = useMemo(() => opsSummary?.questions.slice(0, 12) ?? [], [opsSummary]);
  const topReplyRateQuestions = useMemo(
    () => [...(opsSummary?.questions ?? [])].sort((a, b) => b.reasonCtr - a.reasonCtr).slice(0, 6),
    [opsSummary],
  );

  const fetchOpts: RequestInit = useMemo(
    () => ({ credentials: "include" as RequestCredentials }),
    [],
  );

  async function loadAll() {
    if (!authed) return;
    setLoading(true);
    setMessage("");

    try {
      const [pendingRes, approvedRes, inspectRes, repliesRes] = await Promise.all([
        fetch("/api/internal/question-candidates?status=pending", fetchOpts),
        fetch("/api/internal/question-candidates?status=approved", fetchOpts),
        fetch("/api/internal/question-inspect?all=true", fetchOpts),
        fetch("/api/internal/moderation/replies?limit=20", fetchOpts),
      ]);

      if (!pendingRes.ok || !approvedRes.ok || !inspectRes.ok || !repliesRes.ok) {
        setMessage("어드민 데이터를 불러오지 못했어요.");
        return;
      }

      const pendingJson = (await pendingRes.json()) as { items: QuestionCandidate[] };
      const approvedJson = (await approvedRes.json()) as { items: QuestionCandidate[] };
      const inspectJson = (await inspectRes.json()) as InspectSummary;
      const repliesJson = (await repliesRes.json()) as { items: AdminReplyItem[] };

      setPending(pendingJson.items);
      setApproved(approvedJson.items);
      setOpsSummary(inspectJson);
      setRecentReplies(repliesJson.items);
    } catch {
      setMessage("어드민 요청에 실패했어요.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authed) {
      void loadAll();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  async function handleLogin() {
    const email = emailInput.trim();
    if (!email) {
      setMessage("이메일을 입력해주세요.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setMessage(json.message ?? "로그인 실패");
        return;
      }
      setAuthed(true);
    } catch {
      setMessage("로그인 요청에 실패했어요.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    } catch {
      // ignore
    } finally {
      setAuthed(false);
      setPending([]);
      setApproved([]);
      setOpsSummary(null);
      setRecentReplies([]);
      setLoading(false);
    }
  }

  async function createCandidate() {
    if (!authed) return;

    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/internal/question-candidates", {
        method: "POST",
        headers: authHeaders,
        credentials: "include",
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({ message: "후보 생성 실패" }));
        setMessage(json.message ?? "후보 생성 실패");
        return;
      }

      setForm(EMPTY_FORM);
      setMessage("후보가 추가됐어요.");
      await loadAll();
    } catch {
      setMessage("후보 생성 요청에 실패했어요.");
    } finally {
      setLoading(false);
    }
  }

  async function approveCandidate(id: string) {
    if (!authed) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/internal/question-candidates/${id}/approve`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({ message: "승인 실패" }));
        setMessage(json.message ?? "승인 실패");
        return;
      }

      setMessage("후보를 승인했고, 다음 세션부터 피드에 반영됩니다.");
      await loadAll();
    } catch {
      setMessage("승인 요청에 실패했어요.");
    } finally {
      setLoading(false);
    }
  }

  async function rejectCandidate(id: string) {
    if (!authed) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/internal/question-candidates/${id}/reject`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({ message: "반려 실패" }));
        setMessage(json.message ?? "반려 실패");
        return;
      }

      setMessage("후보를 반려했습니다.");
      await loadAll();
    } catch {
      setMessage("반려 요청에 실패했어요.");
    } finally {
      setLoading(false);
    }
  }

  async function refreshMetrics() {
    if (!authed) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/internal/question-metrics", {
        method: "POST",
        headers: authHeaders,
        credentials: "include",
        body: JSON.stringify({ batch: true }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({ message: "메트릭 업데이트 실패" }));
        setMessage(json.message ?? "메트릭 업데이트 실패");
        return;
      }

      const json = (await res.json()) as { total?: number; success?: number };
      setMessage(`메트릭 배치를 실행했어요. ${json.success ?? 0}/${json.total ?? 0}`);
      await loadAll();
    } catch {
      setMessage("메트릭 배치 실행에 실패했어요.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteReplyItem(id: string) {
    if (!authed) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/internal/moderation/replies/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({ message: "답글 삭제 실패" }));
        setMessage(json.message ?? "답글 삭제 실패");
        return;
      }

      setMessage("답글을 삭제했습니다.");
      await loadAll();
    } catch {
      setMessage("답글 삭제 요청에 실패했어요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="round-shell min-h-full px-4 pb-12 pt-safe-top">
      <div className="mx-auto max-w-6xl space-y-4">
        <section className="round-panel-strong rounded-3xl p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="round-mono text-[11px] text-cyan-200/70">Round Admin</p>
              <h1 className="mt-2 text-2xl font-black tracking-[-0.03em] text-white">질문 운영 어드민</h1>
              <p className="mt-2 text-sm leading-6 text-white/55">
                후보 승인, 메트릭 배치, 피드 상태 확인, 최근 답글 모더레이션을 한 곳에서 다룹니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void refreshMetrics()}
                disabled={!authed || loading}
                className="min-h-11 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-4 text-sm font-semibold text-cyan-100 disabled:opacity-50"
              >
                메트릭 배치 실행
              </button>
              <button
                type="button"
                onClick={() => void loadAll()}
                disabled={!authed || loading}
                className="min-h-11 rounded-2xl border border-white/12 px-4 text-sm font-semibold text-white/80 disabled:opacity-50"
              >
                전체 새로고침
              </button>
              {authed && (
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="min-h-11 rounded-2xl border border-white/10 px-4 text-sm font-semibold text-white/55"
                >
                  로그아웃
                </button>
              )}
            </div>
          </div>

          {!authed && (
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleLogin();
                }}
                placeholder="관리자 이메일"
                autoComplete="email"
                className="min-h-11 flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none"
              />
              <button
                type="button"
                onClick={() => void handleLogin()}
                disabled={loading}
                className="min-h-11 rounded-2xl bg-white px-4 text-sm font-bold text-slate-900 disabled:opacity-50"
              >
                로그인
              </button>
            </div>
          )}
          {message && <p className="mt-3 text-sm text-cyan-200/80">{message}</p>}
        </section>

        <section className="grid gap-3 md:grid-cols-5">
          {(["test", "rising", "evergreen", "archive"] as QuestionStatus[]).map((status) => (
            <article key={status} className="round-panel rounded-3xl p-4">
              <p className="round-mono text-[11px] text-white/45">{status}</p>
              <p className="mt-2 text-2xl font-black text-white">{opsSummary?.statusCounts?.[status] ?? 0}</p>
            </article>
          ))}
          <article className="round-panel rounded-3xl p-4">
            <p className="round-mono text-[11px] text-white/45">total</p>
            <p className="mt-2 text-2xl font-black text-white">{opsSummary?.total ?? 0}</p>
          </article>
        </section>

        <div className="grid gap-4 xl:grid-cols-[1.15fr,0.85fr]">
          <section className="round-panel rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">질문 후보 추가</h2>
              <span className="round-mono text-xs text-white/45">pending → approve → live</span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input className="min-h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none" placeholder="질문" value={form.question} onChange={(e) => setForm((prev) => ({ ...prev, question: e.target.value }))} />
              <select className="min-h-11 rounded-2xl border border-white/10 bg-[#111522] px-4 text-sm text-white outline-none" value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value as Category }))}>
                {CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <input className="min-h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none" placeholder="옵션 A" value={form.optionA} onChange={(e) => setForm((prev) => ({ ...prev, optionA: e.target.value }))} />
              <input className="min-h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none" placeholder="옵션 B" value={form.optionB} onChange={(e) => setForm((prev) => ({ ...prev, optionB: e.target.value }))} />
              <select className="min-h-11 rounded-2xl border border-white/10 bg-[#111522] px-4 text-sm text-white outline-none" value={form.topic} onChange={(e) => setForm((prev) => ({ ...prev, topic: e.target.value as QuestionTopic }))}>
                {TOPICS.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <select className="min-h-11 rounded-2xl border border-white/10 bg-[#111522] px-4 text-sm text-white outline-none" value={form.tension} onChange={(e) => setForm((prev) => ({ ...prev, tension: e.target.value as QuestionTension }))}>
                {TENSIONS.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <select className="min-h-11 rounded-2xl border border-white/10 bg-[#111522] px-4 text-sm text-white outline-none" value={form.valueA} onChange={(e) => setForm((prev) => ({ ...prev, valueA: e.target.value as QuestionCandidateInsert["valueA"] }))}>
                {SNACK_TAGS.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <select className="min-h-11 rounded-2xl border border-white/10 bg-[#111522] px-4 text-sm text-white outline-none" value={form.valueB} onChange={(e) => setForm((prev) => ({ ...prev, valueB: e.target.value as QuestionCandidateInsert["valueB"] }))}>
                {SNACK_TAGS.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <button
              type="button"
              onClick={() => void createCandidate()}
              disabled={loading}
              className="mt-4 min-h-11 rounded-2xl bg-cyan-300 px-5 text-sm font-bold text-slate-950 disabled:opacity-50"
            >
              후보 올리기
            </button>
          </section>

          <section className="round-panel rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">운영 힌트</h2>
              <span className="round-mono text-xs text-white/45">feed quality</span>
            </div>
            <div className="mt-4 space-y-3">
              {topReplyRateQuestions.length === 0 && <p className="text-sm text-white/45">질문 메트릭이 아직 없습니다.</p>}
              {topReplyRateQuestions.map((item) => (
                <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-white">{item.question}</p>
                    <span className={`rounded-full border px-2 py-1 text-[11px] ${getStatusTone(item.derivedStatus)}`}>
                      {item.derivedStatus}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-white/55">
                    <span>이유 CTR {formatPercent(item.reasonCtr)}</span>
                    <span>heat {Math.round(item.heatScore)}</span>
                    <span>votes {item.voteCount}</span>
                    <span>feedback {item.feedbackTotal}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="round-panel rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">승인 대기</h2>
              <span className="round-mono text-xs text-white/45">{pending.length}</span>
            </div>
            <div className="mt-4 space-y-3">
              {pending.length === 0 && <p className="text-sm text-white/45">대기 중인 후보가 없습니다.</p>}
              {pending.map((item) => (
                <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-white">{item.question}</p>
                      <p className="mt-1 text-xs text-white/45">
                        {item.category} · {item.topic}/{item.tension}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => void approveCandidate(item.id)}
                        className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-900"
                      >
                        승인
                      </button>
                      <button
                        type="button"
                        onClick={() => void rejectCandidate(item.id)}
                        className="rounded-xl border border-white/12 px-3 py-2 text-xs font-semibold text-white/75"
                      >
                        반려
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-white/70">A. {item.optionA.label}</p>
                  <p className="mt-1 text-xs text-white/70">B. {item.optionB.label}</p>
                  <p className="mt-3 text-[11px] text-cyan-200/70">{item.valueA} / {item.valueB}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="round-panel rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">승인 완료</h2>
              <span className="round-mono text-xs text-white/45">{approved.length}</span>
            </div>
            <div className="mt-4 space-y-3">
              {approved.length === 0 && <p className="text-sm text-white/45">아직 승인된 후보가 없습니다.</p>}
              {approved.map((item) => (
                <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm font-bold text-white">{item.question}</p>
                  <p className="mt-1 text-xs text-white/45">
                    {item.category} · {item.topic}/{item.tension}
                  </p>
                  <p className="mt-3 text-xs text-white/70">A. {item.optionA.label}</p>
                  <p className="mt-1 text-xs text-white/70">B. {item.optionB.label}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <section className="round-panel rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">질문 성적표</h2>
            <span className="round-mono text-xs text-white/45">status-aware feed</span>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm text-white/80">
              <thead className="text-[11px] uppercase tracking-[0.14em] text-white/35">
                <tr>
                  <th className="pb-3 pr-4">질문</th>
                  <th className="pb-3 pr-4">status</th>
                  <th className="pb-3 pr-4">split</th>
                  <th className="pb-3 pr-4">heat</th>
                  <th className="pb-3 pr-4">votes</th>
                  <th className="pb-3 pr-4">이유 CTR</th>
                  <th className="pb-3">feedback</th>
                </tr>
              </thead>
              <tbody>
                {topQuestions.map((item) => (
                  <tr key={item.id} className="border-t border-white/8 align-top">
                    <td className="py-3 pr-4">
                      <p className="font-semibold text-white">{item.question}</p>
                      <p className="mt-1 text-[11px] text-white/40">{item.topic}/{item.tension}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full border px-2 py-1 text-[11px] ${getStatusTone(item.derivedStatus)}`}>
                        {item.derivedStatus}
                      </span>
                    </td>
                    <td className="py-3 pr-4">{item.splitScore} ({item.splitGrade})</td>
                    <td className="py-3 pr-4">{Math.round(item.heatScore)}</td>
                    <td className="py-3 pr-4">{item.voteCount}</td>
                    <td className="py-3 pr-4">{formatPercent(item.reasonCtr)}</td>
                    <td className="py-3">
                      <div className="space-y-1">
                        <p>{item.feedbackTotal}</p>
                        {item.feedbackByReason && (
                          <p className="text-[11px] text-white/40">
                            약함 {item.feedbackByReason.weak_context ?? 0} · 뻔함 {item.feedbackByReason.too_obvious ?? 0}
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="round-panel rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">최근 답글 모더레이션</h2>
            <span className="round-mono text-xs text-white/45">{recentReplies.length}</span>
          </div>
          <div className="mt-4 space-y-3">
            {recentReplies.length === 0 && <p className="text-sm text-white/45">최근 답글이 없습니다.</p>}
            {recentReplies.map((reply) => (
              <article key={reply.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-white">{reply.questionText ?? reply.questionId ?? "질문 없음"}</p>
                    <p className="mt-1 text-[11px] text-white/40">
                      {reply.reasonSide ?? "?"} 이유 · {reply.selectedOptionId ?? "?"} 선택 · {reply.tone} · {formatDate(reply.createdAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void deleteReplyItem(reply.id)}
                    className="rounded-xl border border-red-300/20 bg-red-300/10 px-3 py-2 text-xs font-semibold text-red-100"
                  >
                    삭제
                  </button>
                </div>
                <p className="mt-3 text-xs text-white/55">원문 이유: {reply.reasonText}</p>
                <p className="mt-2 text-sm text-white/85">{reply.replyText}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

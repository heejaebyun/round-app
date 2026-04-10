#!/usr/bin/env node
/**
 * Research agent — Claude CLI subprocess로 질문 후보를 생성해 Supabase에 적재.
 *
 * Usage:
 *   node scripts/research.mjs --locale ko-KR --keywords "직장 갈등,축의금" --count 3
 *   node scripts/research.mjs --locale en-US --keywords "roommate conflict" --count 4
 *
 * 동작:
 *   1. Claude CLI (`claude -p`)에 research + refine + JSON-only 프롬프트 한 방에 전달
 *   2. 응답에서 JSON 추출 → 스키마 검증 → 통과한 것만
 *   3. POST /api/internal/question-candidates 로 INSERT (review_status=pending)
 *
 * 안전장치: count 3~4, JSON only, timeout 5분, 1회 retry, 검증 실패 discard.
 */

import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ── env.local 수동 파싱 ────────────────────────────────────────────
function loadEnvLocal() {
  try {
    const text = readFileSync(resolve(ROOT, ".env.local"), "utf8");
    for (const line of text.split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  } catch {
    // ignore
  }
}
loadEnvLocal();

// ── CLI args ───────────────────────────────────────────────────────
function parseArgs() {
  const args = { locale: "ko-KR", keywords: "", count: 3 };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--locale") args.locale = argv[++i];
    else if (a === "--keywords") args.keywords = argv[++i];
    else if (a === "--count") args.count = Math.max(1, Math.min(4, Number(argv[++i]) || 3));
  }
  if (!args.keywords) {
    console.error("error: --keywords required (comma-separated)");
    process.exit(1);
  }
  return args;
}

// ── Valid enums (must match lib/types.ts) ──────────────────────────
const CATEGORIES = ["음식", "커리어", "관계", "소비", "라이프", "여행", "트렌드"];
const TOPICS = ["relationship", "money", "manners", "work", "family", "self", "lifestyle", "society"];
const TENSIONS = [
  "care_vs_principle",
  "present_vs_future",
  "freedom_vs_responsibility",
  "stability_vs_growth",
  "privacy_vs_openness",
  "efficiency_vs_empathy",
  "honesty_vs_harmony",
  "fairness_vs_generosity",
];
const SNACK_TAGS = [
  "야식파", "맵단짠러", "디저트덕후", "가성비파", "플렉서",
  "충동구매러", "신상헌터", "야행성", "집콕러", "핫플러",
  "갓생러", "숏폼중독", "앱테크족",
  "현실파", "예의파", "직진파", "거리두기파", "공유파", "경계파",
  "의리파", "원칙파", "맞춤파", "직설파", "완곡파",
];
const LOCALES = ["ko-KR", "en-US", "en-GB"];

// ── Prompt builder ─────────────────────────────────────────────────
function buildPrompt({ locale, keywords, count }) {
  const keywordList = keywords.split(",").map((k) => k.trim()).filter(Boolean);
  return `당신은 Round 앱(한국어 A/B 선택 소셜 앱)의 질문 리서치 에이전트입니다.

# Task
다음 키워드에 대해 공개 웹을 리서치하여, 실제로 의견이 갈릴만한 현실 갈등형 A/B 질문 후보 ${count}개를 만드세요.

Locale: ${locale}
Keywords: ${keywordList.join(", ")}

# Quality bar
- 양쪽 입장이 모두 합리적 (50:50 근처로 갈림)
- 질문은 중립 프레이밍: "더 가까운 쪽은?" 계열 (유도 질문 금지)
- 혐오/정치/젠더전쟁/저격성 금지
- 한국 사용자 일상에서 즉답 가능한 상황
- 옵션 A/B는 짧고 대립적

# Output schema (JSON only, no prose, no markdown fence)
{
  "candidates": [
    {
      "question": "string (Korean, ends with question mark)",
      "category": "one of: ${CATEGORIES.join(" | ")}",
      "optionA": "string (short Korean)",
      "optionB": "string (short Korean)",
      "valueA": "one of: ${SNACK_TAGS.join(" | ")}",
      "valueB": "one of: ${SNACK_TAGS.join(" | ")}",
      "topic": "one of: ${TOPICS.join(" | ")}",
      "tension": "one of: ${TENSIONS.join(" | ")}",
      "sourceNote": "짧은 요약 + 참고 URL 1개 (형식: '요약 - https://...')"
    }
  ]
}

# Rules
- Return ONLY the JSON object. No explanation, no markdown, no \`\`\`.
- Exactly ${count} candidates.
- All enum fields must match exactly one of the listed values.
- valueA and valueB must be DIFFERENT tags.
`;
}

// ── Claude CLI subprocess ──────────────────────────────────────────
function callClaude(prompt, timeoutMs = 300_000) {
  return new Promise((resolvePromise, reject) => {
    const proc = spawn("claude", ["-p", prompt], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      proc.kill("SIGKILL");
      reject(new Error(`claude CLI timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    proc.stdout.on("data", (d) => (stdout += d.toString()));
    proc.stderr.on("data", (d) => (stderr += d.toString()));
    proc.on("error", (e) => {
      clearTimeout(timer);
      reject(e);
    });
    proc.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        reject(new Error(`claude exited ${code}: ${stderr.slice(0, 500)}`));
        return;
      }
      resolvePromise(stdout);
    });
  });
}

// ── Extract + validate ─────────────────────────────────────────────
function extractJson(raw) {
  // Strip code fences if present
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const text = fenced ? fenced[1] : raw;
  // Find first {...} block
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("no JSON object found in response");
  }
  const json = text.slice(start, end + 1);
  return JSON.parse(json);
}

function validateCandidate(c, locale) {
  const errs = [];
  if (typeof c.question !== "string" || c.question.length < 5) errs.push("question");
  if (!CATEGORIES.includes(c.category)) errs.push(`category=${c.category}`);
  if (typeof c.optionA !== "string" || !c.optionA) errs.push("optionA");
  if (typeof c.optionB !== "string" || !c.optionB) errs.push("optionB");
  if (!SNACK_TAGS.includes(c.valueA)) errs.push(`valueA=${c.valueA}`);
  if (!SNACK_TAGS.includes(c.valueB)) errs.push(`valueB=${c.valueB}`);
  if (c.valueA === c.valueB) errs.push("valueA==valueB");
  if (!TOPICS.includes(c.topic)) errs.push(`topic=${c.topic}`);
  if (!TENSIONS.includes(c.tension)) errs.push(`tension=${c.tension}`);
  if (!LOCALES.includes(locale)) errs.push(`locale=${locale}`);
  return errs;
}

// ── POST to candidate API ──────────────────────────────────────────
async function postCandidate(c, locale) {
  const base = process.env.ROUND_API_BASE || "https://round-app-one.vercel.app";
  const key = process.env.INTERNAL_API_KEY;
  if (!key) throw new Error("INTERNAL_API_KEY not set");

  const body = {
    question: c.question,
    category: c.category,
    optionA: c.optionA,
    optionB: c.optionB,
    valueA: c.valueA,
    valueB: c.valueB,
    topic: c.topic,
    tension: c.tension,
    locale,
    sourceType: "internal_submission",
    sourceNote: c.sourceNote ?? null,
  };

  const res = await fetch(`${base}/api/internal/question-candidates`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-key": key,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`POST ${res.status}: ${json.message ?? "unknown"}`);
  return json.id;
}

// ── Main ───────────────────────────────────────────────────────────
async function runOnce(args) {
  const prompt = buildPrompt(args);
  console.log(`[research] calling claude CLI (locale=${args.locale}, count=${args.count})...`);
  const raw = await callClaude(prompt);
  const parsed = extractJson(raw);
  if (!Array.isArray(parsed.candidates)) throw new Error("response has no 'candidates' array");
  return parsed.candidates;
}

async function main() {
  const args = parseArgs();
  if (!LOCALES.includes(args.locale)) {
    console.error(`error: locale must be one of ${LOCALES.join(", ")}`);
    process.exit(1);
  }

  let candidates;
  try {
    candidates = await runOnce(args);
  } catch (e) {
    console.warn(`[research] attempt 1 failed: ${e.message}. retrying once...`);
    try {
      candidates = await runOnce(args);
    } catch (e2) {
      console.error(`[research] retry failed: ${e2.message}`);
      process.exit(2);
    }
  }

  console.log(`[research] received ${candidates.length} candidates`);

  let inserted = 0;
  let discarded = 0;
  for (const c of candidates) {
    const errs = validateCandidate(c, args.locale);
    if (errs.length > 0) {
      console.warn(`[discard] ${c.question?.slice(0, 40) ?? "(no question)"} — ${errs.join(", ")}`);
      discarded++;
      continue;
    }
    try {
      const id = await postCandidate(c, args.locale);
      console.log(`[insert] ${id} — ${c.question}`);
      inserted++;
    } catch (e) {
      console.warn(`[discard] POST failed: ${e.message}`);
      discarded++;
    }
  }

  console.log(`\n[research] done. inserted=${inserted} discarded=${discarded}`);
  if (inserted === 0) process.exit(3);
}

main().catch((e) => {
  console.error(`[research] fatal: ${e.message}`);
  process.exit(1);
});

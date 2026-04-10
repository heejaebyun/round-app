import type { UserChoice, ChoiceDNA, Question, UserScores } from "@/lib/types";
import { SEED_QUESTIONS } from "@/data/questions";

// 질문 맵 (id → Question)
const questionMap = new Map<string, Question>();
for (const q of SEED_QUESTIONS) questionMap.set(q.id, q);

const ARCHETYPE_MAP: Record<string, { name: string; desc: string }> = {
  "0000": { name: "나홀로 풀코스", desc: "내 예산 안에서 가장 완벽한 혼자만의 시간을 보냄" },
  "1000": { name: "은둔형 플렉서", desc: "혼자 쉬다가도 꽂히는 순간 망설임 없이 결제함" },
  "0100": { name: "안정형 축적가", desc: "불필요한 지출과 만남을 통제하며 안정적으로 쌓아감" },
  "1100": { name: "저자극 축적가", desc: "돈 쓰는 일도 바쁘게 움직이는 일도 줄이며 자연스럽게 모음" },
  "0010": { name: "계획된 호캉스", desc: "모임의 일정과 식당 예약을 도맡아 책임지고 즐김" },
  "1010": { name: "즉흥형 욜로족", desc: "사람들과 어울리며 지금 이 순간의 즐거움에 집중함" },
  "0110": { name: "예산형 조율가", desc: "여럿이 어울리지만 예산과 낭비는 철저히 관리함" },
  "1110": { name: "선택형 사교가", desc: "사람들과 어울리되 에너지와 비용은 영리하게 조절함" },
  "0001": { name: "계산된 풀악셀", desc: "혼자서 치밀하게 판을 짜고 필요한 장비는 다 구비함" },
  "1001": { name: "직진형 불도저", desc: "꽂히는 것이 있으면 가격보다 직감을 먼저 따름" },
  "0101": { name: "타이밍 승부사", desc: "평소엔 아끼다가 확실한 기회가 오면 크게 베팅함" },
  "1101": { name: "본능형 승부사", desc: "평소엔 조용하지만 꽂히는 순간 직감적으로 크게 들어감" },
  "0011": { name: "전략적 투자자", desc: "사람을 만나고 인맥을 형성하는 데 쓰는 비용을 아끼지 않음" },
  "1011": { name: "번개모임 주도자", desc: "즉흥적으로 사람을 모으고 판을 벌리는 행동파" },
  "0111": { name: "실속형 네트워커", desc: "사람들과 어울리며 기회를 엿보지만 헛돈은 쓰지 않음" },
  "1111": { name: "무자본 행동대장", desc: "자본이나 계획이 부족해도 사람을 모아 일단 부딪혀 봄" },
};

export function calculateDNA(choices: UserChoice[]): ChoiceDNA {
  const total = choices.length;
  const scores: UserScores = { Action: 50, Motivation: 50, Relation: 50, Reward: 50 };
  const tags: Record<string, number> = {};

  for (const c of choices) {
    const q = questionMap.get(c.questionId);
    if (!q) continue;

    if (q.qtype === "Core") {
      const delta = c.side === "A" ? q.valueA : q.valueB;
      scores[q.axis] = Math.max(0, Math.min(100, scores[q.axis] + delta));
    } else {
      // Snack → 태그 카운트
      const tag = c.side === "A" ? q.valueA : q.valueB;
      tags[tag] = (tags[tag] || 0) + 1;
    }
  }

  // 16타입 판정: 각 축 50 초과 → 1, 이하 → 0
  const binaryKey = [
    scores.Action > 50 ? "1" : "0",
    scores.Reward > 50 ? "1" : "0",
    scores.Relation > 50 ? "1" : "0",
    scores.Motivation > 50 ? "1" : "0",
  ].join("");

  const archetype = ARCHETYPE_MAP[binaryKey] || { name: "미지의 탐험가", desc: "아직 데이터가 부족합니다" };

  // 상위 1개 태그
  let topTag: string | null = null;
  let maxCount = 0;
  for (const [tag, count] of Object.entries(tags)) {
    if (count > maxCount) { maxCount = count; topTag = tag; }
  }

  const fullTitle = topTag ? `${topTag} ${archetype.name}` : archetype.name;

  return {
    totalChoices: total,
    scores,
    archetype: archetype.name,
    archetypeDescription: archetype.desc,
    topTag,
    fullTitle,
    tags,
  };
}

// --- 심화 보기용 해석 ---

const AXIS_INTERP: Record<string, [string, string, string]> = {
  // [낮을 때, 중간, 높을 때] — 점수 기준
  Action: [
    "시작 전 머릿속 정리가 필요한 편이에요. 계획 없이 움직이면 불안해질 수 있어요.",
    "상황에 따라 계획도 즉흥도 유연하게 전환하는 편이에요.",
    "일단 움직이고 나서 생각하는 타입. 즉흥이 오히려 에너지를 줘요.",
  ],
  Reward: [
    "지금 쓰고 지금 즐기는 쪽에 더 끌려요. 경험이 곧 보상이에요.",
    "쓸 땐 쓰고 모을 땐 모으는 균형 잡힌 편이에요.",
    "당장 만족보다 미래의 선택지를 넓히는 쪽을 택해요.",
  ],
  Relation: [
    "혼자만의 시간이 충전의 핵심이에요. 사람이 많으면 에너지가 빠져요.",
    "혼자도, 같이도 적절히 조율하는 편이에요.",
    "사람과 함께할 때 에너지가 올라요. 나누면 배가 되는 타입이에요.",
  ],
  Motivation: [
    "지금의 안정이 소중해요. 무리한 도전보다 확실한 걸 선호해요.",
    "안정과 도전 사이에서 균형을 잡는 편이에요.",
    "더 높은 곳을 향해 움직여요. 성장이 멈추면 불안한 타입이에요.",
  ],
};

export function getAxisInterpretation(axis: string, score: number): string {
  const interps = AXIS_INTERP[axis];
  if (!interps) return "";
  if (score <= 35) return interps[0];
  if (score >= 65) return interps[2];
  return interps[1];
}

const TAG_INTERP: Record<string, string> = {
  야식파: "보상과 위로를 음식에서 빠르게 찾는 편",
  맵단짠러: "자극적인 맛에서 스트레스를 해소하는 타입",
  디저트덕후: "달콤함으로 하루의 작은 행복을 챙기는 편",
  가성비파: "돈 쓸 때 가치를 꼼꼼히 따지는 실속형",
  플렉서: "좋은 건 가격에 구애받지 않고 지르는 편",
  충동구매러: "고민 없이 결제하는 순간의 쾌감을 아는 타입",
  신상헌터: "새로운 것에 먼저 반응하는 얼리어답터 기질",
  야행성: "밤이 돼야 진짜 내 시간이 시작되는 편",
  집콕러: "집이 세상에서 가장 편한 장소인 타입",
  핫플러: "새로운 공간과 경험을 적극적으로 탐험하는 편",
  갓생러: "루틴과 자기관리에 진심인 타입",
  숏폼중독: "짧고 강한 콘텐츠에 도파민을 느끼는 편",
  앱테크족: "작은 돈도 놓치지 않는 알뜰한 디지털 습관",
};

export function getTagInterpretation(tag: string): string {
  return TAG_INTERP[tag] ?? "";
}

export function generateSummaryLine(
  archetype: string,
  topTag: string | null,
  scores: UserScores,
): string {
  // 가장 극단적인 축 찾기
  let extremeAxis = "";
  let extremeDist = 0;
  for (const axis of Object.keys(scores) as (keyof UserScores)[]) {
    const dist = Math.abs(scores[axis] - 50);
    if (dist > extremeDist) { extremeDist = dist; extremeAxis = axis; }
  }

  const axisHint: Record<string, [string, string]> = {
    Action: ["계획을 세워야 안심되는", "일단 움직이는"],
    Reward: ["지금을 즐기는", "미래를 준비하는"],
    Relation: ["혼자가 편한", "사람과 함께하는"],
    Motivation: ["안정을 택하는", "도전을 택하는"],
  };

  const hints = axisHint[extremeAxis];
  const score = extremeAxis ? scores[extremeAxis as keyof UserScores] : 50;
  const axisWord = hints ? (score > 50 ? hints[1] : hints[0]) : "";
  const tagWord = topTag ? `${topTag} 기질에` : "자기만의 감각으로";

  return `${tagWord} ${axisWord} ${archetype}`;
}

export function getDNAProgressMessage(total: number, archetype: string): string {
  if (total === 0) return "";
  if (total <= 3) return "🌱 DNA 생성 중...";
  if (total <= 6) return `🧬 '${archetype}'일 수 있어요`;
  if (total <= 9) return `🔬 ${archetype}에 가까워지고 있어요`;
  if (total === 10) return `✨ 당신은 ${archetype}`;
  return `🧬 ${archetype} — 선택할수록 선명해져요`;
}

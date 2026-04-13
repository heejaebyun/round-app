import type { UserChoice, ChoiceDNA, Question, QuestionLocale, UserScores } from "@/lib/types";
import { SEED_QUESTIONS } from "@/data/questions";
import { isEnglishLocale } from "@/lib/i18n";

// 질문 맵 (id → Question)
const questionMap = new Map<string, Question>();
for (const q of SEED_QUESTIONS) questionMap.set(q.id, q);

// ── Market-specific archetype maps ──────────────────────────────
// en-US and en-PH currently share ARCHETYPE_MAP_EN but the structure
// supports per-market divergence: just add ARCHETYPE_MAP_PH when needed.

const ARCHETYPE_MAP_KO: Record<string, { name: string; desc: string }> = {
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

const ARCHETYPE_MAP_EN: Record<string, { name: string; desc: string }> = {
  "0000": { name: "Solo Perfectionist", desc: "Plans the perfect solo day within budget" },
  "1000": { name: "Quiet Splurger", desc: "Mostly chill, but goes all-in when something clicks" },
  "0100": { name: "Steady Stacker", desc: "Cuts unnecessary spending and builds stability quietly" },
  "1100": { name: "Low-Key Saver", desc: "Minimal spending, minimal hustle — lets savings grow naturally" },
  "0010": { name: "Planned Social", desc: "Organizes the group calendar, picks the restaurants, enjoys the ride" },
  "1010": { name: "YOLO Connector", desc: "Lives in the moment with people around" },
  "0110": { name: "Budget Coordinator", desc: "Social but keeps a tight grip on expenses" },
  "1110": { name: "Smart Socialite", desc: "Hangs out with people but manages energy and money wisely" },
  "0001": { name: "Calculated All-In", desc: "Builds the plan solo, gears up, then goes full throttle" },
  "1001": { name: "Gut-Feel Bulldozer", desc: "When something hits, instinct beats price" },
  "0101": { name: "Timing Player", desc: "Saves by default, bets big when the moment is right" },
  "1101": { name: "Instinct Player", desc: "Usually quiet, but locks in hard when conviction hits" },
  "0011": { name: "Strategic Investor", desc: "Spends freely on people and connections that matter" },
  "1011": { name: "Flash Mob Leader", desc: "Pulls people together on impulse and makes things happen" },
  "0111": { name: "Savvy Networker", desc: "Stays social, spots opportunities, never wastes money" },
  "1111": { name: "Zero-Capital Hustler", desc: "Rallies people and dives in even without a plan or budget" },
};

type ArchetypeEntry = { name: string; desc: string };

/** Select the archetype map for the given market. */
function getArchetypeMap(locale?: string | null): Record<string, ArchetypeEntry> {
  switch (locale) {
    case "ko-KR": return ARCHETYPE_MAP_KO;
    case "en-US": return ARCHETYPE_MAP_EN;
    case "en-PH": return ARCHETYPE_MAP_EN; // diverge later with ARCHETYPE_MAP_PH
    default: return isEnglishLocale(locale) ? ARCHETYPE_MAP_EN : ARCHETYPE_MAP_KO;
  }
}

export function calculateDNA(choices: UserChoice[], locale?: QuestionLocale | string | null): ChoiceDNA {
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

  const en = isEnglishLocale(locale);
  const archetypeMap = getArchetypeMap(locale);
  const fallback = en
    ? { name: "Unknown Explorer", desc: "Not enough data yet" }
    : { name: "미지의 탐험가", desc: "아직 데이터가 부족합니다" };
  const archetype = archetypeMap[binaryKey] || fallback;

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

const AXIS_INTERP_KO: Record<string, [string, string, string]> = {
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

const AXIS_INTERP_EN: Record<string, [string, string, string]> = {
  Action: [
    "You like to sort things out before you start. Going in blind makes you uneasy.",
    "You switch between planning and winging it depending on the situation.",
    "You move first and think later. Spontaneity gives you energy.",
  ],
  Reward: [
    "You lean toward spending now and enjoying the moment. Experiences are the reward.",
    "You balance spending and saving pretty well.",
    "You'd rather keep your options open for the future than cash in now.",
  ],
  Relation: [
    "Solo time is how you recharge. Too many people drains you.",
    "You balance alone time and social time naturally.",
    "Being with people charges you up. Sharing makes everything better.",
  ],
  Motivation: [
    "Stability matters to you. You prefer sure things over risky bets.",
    "You keep a healthy balance between playing it safe and pushing yourself.",
    "You keep moving toward something bigger. Standing still makes you restless.",
  ],
};

export function getAxisInterpretation(axis: string, score: number, locale?: QuestionLocale | string | null): string {
  const interps = (isEnglishLocale(locale) ? AXIS_INTERP_EN : AXIS_INTERP_KO)[axis];
  if (!interps) return "";
  if (score <= 35) return interps[0];
  if (score >= 65) return interps[2];
  return interps[1];
}

const TAG_INTERP_KO: Record<string, string> = {
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
  현실파: "현실적 판단을 우선하는 편",
  예의파: "체면과 예의를 중시하는 편",
  직진파: "고민보다 행동이 먼저인 편",
  거리두기파: "적당한 거리를 유지하는 편",
  공유파: "경험과 정보를 나누는 걸 좋아하는 편",
  경계파: "사생활 경계를 중시하는 편",
  의리파: "관계에서 의리를 우선하는 편",
  원칙파: "원칙과 기준을 지키는 편",
  맞춤파: "상황에 맞춰 유연하게 대응하는 편",
  직설파: "직접적으로 말하는 걸 선호하는 편",
  완곡파: "돌려 말하는 편이 더 편한 타입",
};

const TAG_INTERP_EN: Record<string, string> = {
  Realist: "Grounds decisions in practical reality",
  Courteous: "Values politeness and social grace",
  Direct: "Says what they mean, no sugarcoating",
  Reserved: "Prefers keeping a comfortable distance",
  Open: "Loves sharing experiences and information",
  Private: "Guards personal space and boundaries",
  Loyal: "Puts loyalty first in relationships",
  Principled: "Sticks to their standards and rules",
  Adaptive: "Adjusts smoothly to whatever comes",
  Diplomatic: "Navigates conflict with tact",
  Planner: "Needs a plan before they move",
  Spontaneous: "Thrives on the unexpected",
};

export function getTagInterpretation(tag: string, locale?: QuestionLocale | string | null): string {
  if (isEnglishLocale(locale)) return TAG_INTERP_EN[tag] ?? "";
  return TAG_INTERP_KO[tag] ?? "";
}

export function generateSummaryLine(
  archetype: string,
  topTag: string | null,
  scores: UserScores,
  locale?: QuestionLocale | string | null,
): string {
  let extremeAxis = "";
  let extremeDist = 0;
  for (const axis of Object.keys(scores) as (keyof UserScores)[]) {
    const dist = Math.abs(scores[axis] - 50);
    if (dist > extremeDist) { extremeDist = dist; extremeAxis = axis; }
  }

  if (isEnglishLocale(locale)) {
    const axisHintEn: Record<string, [string, string]> = {
      Action: ["plans-first", "moves-first"],
      Reward: ["lives-in-the-moment", "builds-for-tomorrow"],
      Relation: ["solo-recharger", "people-powered"],
      Motivation: ["stability-seeker", "growth-chaser"],
    };
    const hints = axisHintEn[extremeAxis];
    const score = extremeAxis ? scores[extremeAxis as keyof UserScores] : 50;
    const axisWord = hints ? (score > 50 ? hints[1] : hints[0]) : "";
    const tagWord = topTag ? `${topTag},` : "In their own way,";
    return `${tagWord} a ${axisWord} ${archetype}`;
  }

  const axisHintKo: Record<string, [string, string]> = {
    Action: ["계획을 세워야 안심되는", "일단 움직이는"],
    Reward: ["지금을 즐기는", "미래를 준비하는"],
    Relation: ["혼자가 편한", "사람과 함께하는"],
    Motivation: ["안정을 택하는", "도전을 택하는"],
  };
  const hints = axisHintKo[extremeAxis];
  const score = extremeAxis ? scores[extremeAxis as keyof UserScores] : 50;
  const axisWord = hints ? (score > 50 ? hints[1] : hints[0]) : "";
  const tagWord = topTag ? `${topTag} 기질에` : "자기만의 감각으로";
  return `${tagWord} ${axisWord} ${archetype}`;
}

export function getDNAProgressMessage(total: number, archetype: string, locale?: QuestionLocale | string | null): string {
  if (total === 0) return "";
  if (isEnglishLocale(locale)) {
    if (total <= 3) return "🌱 Building your DNA…";
    if (total <= 6) return `🧬 You might be '${archetype}'`;
    if (total <= 9) return `🔬 Getting closer to ${archetype}`;
    if (total === 10) return `✨ You are ${archetype}`;
    return `🧬 ${archetype} — gets clearer with every pick`;
  }
  if (total <= 3) return "🌱 DNA 생성 중...";
  if (total <= 6) return `🧬 '${archetype}'일 수 있어요`;
  if (total <= 9) return `🔬 ${archetype}에 가까워지고 있어요`;
  if (total === 10) return `✨ 당신은 ${archetype}`;
  return `🧬 ${archetype} — 선택할수록 선명해져요`;
}

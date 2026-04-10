import type { Question } from "@/lib/types";

/**
 * Starter questions — 신규 유저가 첫 세션에서 보는 질문.
 * 고정 순서: S S C S C S C S S C (가벼운 것 먼저, Core 사이에 Snack)
 */

export const STARTER_QUESTIONS: Question[] = [
  // 1. Snack — 축의금 (현실 갈등형)
  {
    id: "d1-01b", qtype: "Snack", axis: null,
    valueA: "현실파", valueB: "예의파",
    displayType: "text", category: "관계", categoryEmoji: "💕",
    topic: "manners", tension: "fairness_vs_generosity",
    question: "친구 결혼식 축의금 5만 원, 더 가까운 쪽은?",
    optionA: { label: "참석이 더 중요하니까 괜찮다" },
    optionB: { label: "요즘 물가에 5만 원은 적다" },
    resultA: 48, resultB: 52, totalVotes: 412,
    reasons: [
      { side: "A", text: "참석이 더 중요하지 금액이 중요한가", likes: 38 },
      { side: "B", text: "요즘 밥값만 해도 5만 원인데", likes: 41 },
    ],
  },
  // 2. Snack — 읽씹
  {
    id: "d1-02b", qtype: "Snack", axis: null,
    valueA: "직진파", valueB: "거리두기파",
    displayType: "text", category: "관계", categoryEmoji: "💕",
    topic: "relationship", tension: "care_vs_principle",
    question: "카톡 읽씹 당했을 때, 더 가까운 쪽은?",
    optionA: { label: "한 번 더 보낸다" },
    optionB: { label: "그냥 기다린다" },
    resultA: 46, resultB: 54, totalVotes: 398,
    reasons: [
      { side: "A", text: "확인은 해야 마음이 편함", likes: 34 },
      { side: "B", text: "재촉하면 오히려 역효과", likes: 39 },
    ],
  },
  // 3. Core — 행동 축 (Action)
  {
    id: "d1-03", qtype: "Core", axis: "Action",
    valueA: -10, valueB: 10,
    displayType: "text", category: "라이프", categoryEmoji: "🌿",
    topic: "self", tension: "freedom_vs_responsibility",
    question: "여행 짐 싸기는?",
    optionA: { label: "리스트부터 쓰고 챙긴다" },
    optionB: { label: "전날 밤 몰아서 싼다" },
    resultA: 47, resultB: 53, totalVotes: 365,
    reasons: [
      { side: "A", text: "빠뜨리면 여행이 망함", likes: 31 },
      { side: "B", text: "어차피 현지에서 살 수 있음", likes: 37 },
    ],
  },
  // 4. Snack — 연인 폰 비번
  {
    id: "d1-04b", qtype: "Snack", axis: null,
    valueA: "공유파", valueB: "경계파",
    displayType: "text", category: "관계", categoryEmoji: "💕",
    topic: "relationship", tension: "privacy_vs_openness",
    question: "연인이 휴대폰 비밀번호를 물으면, 더 가까운 쪽은?",
    optionA: { label: "알려줄 수 있다" },
    optionB: { label: "사생활이라 싫다" },
    resultA: 44, resultB: 56, totalVotes: 467,
    reasons: [
      { side: "A", text: "숨길 게 없으면 알려줘도 되잖아", likes: 35 },
      { side: "B", text: "신뢰는 확인하는 게 아니라 믿는 거", likes: 42 },
    ],
  },
  // 5. Core — 보상 축 (Reward)
  {
    id: "d1-05", qtype: "Core", axis: "Reward",
    valueA: -10, valueB: 10,
    displayType: "text", category: "소비", categoryEmoji: "💸",
    topic: "money", tension: "present_vs_future",
    question: "뜻밖의 100만 원이 생겼다",
    optionA: { label: "바로 쓴다" },
    optionB: { label: "불려둔다" },
    resultA: 44, resultB: 56, totalVotes: 523,
    reasons: [
      { side: "A", text: "지금 안 쓰면 언제 쓰나", likes: 41 },
      { side: "B", text: "100만 원은 불려야 의미 있음", likes: 45 },
    ],
  },
  // 6. Snack — 친구 돈 빌려달라
  {
    id: "d1-06b", qtype: "Snack", axis: null,
    valueA: "의리파", valueB: "원칙파",
    displayType: "text", category: "소비", categoryEmoji: "💸",
    topic: "relationship", tension: "fairness_vs_generosity",
    question: "친구가 돈을 빌려달라고 하면, 더 가까운 쪽은?",
    optionA: { label: "한 번은 도와준다" },
    optionB: { label: "돈거래는 관계를 망친다" },
    resultA: 42, resultB: 58, totalVotes: 478,
    reasons: [
      { side: "A", text: "친구잖아 도와줘야지", likes: 31 },
      { side: "B", text: "돈 거래는 관계를 망가뜨림", likes: 44 },
    ],
  },
  // 7. Core — 관계 축 (Relation)
  {
    id: "d1-07", qtype: "Core", axis: "Relation",
    valueA: -10, valueB: 10,
    displayType: "text", category: "관계", categoryEmoji: "💕",
    topic: "relationship", tension: "privacy_vs_openness",
    question: "최악의 하루 끝, 퇴근 후 나는?",
    optionA: { label: "혼자 조용히 쉰다" },
    optionB: { label: "친구한테 바로 전화한다" },
    resultA: 52, resultB: 48, totalVotes: 445,
    reasons: [
      { side: "A", text: "혼자 있어야 충전됨", likes: 39 },
      { side: "B", text: "말해야 속이 풀림", likes: 36 },
    ],
  },
  // 8. Snack — 회식 2차
  {
    id: "d1-08b", qtype: "Snack", axis: null,
    valueA: "경계파", valueB: "맞춤파",
    displayType: "text", category: "커리어", categoryEmoji: "💼",
    topic: "work", tension: "freedom_vs_responsibility",
    question: "회식 2차, 더 가까운 쪽은?",
    optionA: { label: "빠져도 되는 자리" },
    optionB: { label: "어느 정도는 맞춰야 함" },
    resultA: 53, resultB: 47, totalVotes: 445,
    reasons: [
      { side: "A", text: "사생활까지 회사가 침범하면 안 됨", likes: 40 },
      { side: "B", text: "사회생활은 어느 정도 맞추는 것도 실력", likes: 34 },
    ],
  },
  // 9. Snack — 썸 거절
  {
    id: "d1-09b", qtype: "Snack", axis: null,
    valueA: "직설파", valueB: "완곡파",
    displayType: "text", category: "관계", categoryEmoji: "💕",
    topic: "relationship", tension: "honesty_vs_harmony",
    question: "마음 없는 썸/소개팅 상대에게, 더 가까운 쪽은?",
    optionA: { label: "바로 말한다" },
    optionB: { label: "자연스럽게 멀어진다" },
    resultA: 47, resultB: 53, totalVotes: 423,
    reasons: [
      { side: "A", text: "시간 끌면 서로 피곤함", likes: 36 },
      { side: "B", text: "직접 말하면 상대가 더 상처받음", likes: 33 },
    ],
  },
  // 10. Core — 동기 축 (Motivation)
  {
    id: "d1-10", qtype: "Core", axis: "Motivation",
    valueA: -10, valueB: 10,
    displayType: "text", category: "커리어", categoryEmoji: "💼",
    topic: "work", tension: "stability_vs_growth",
    question: "이직 오퍼가 두 개 왔다",
    optionA: { label: "안정적이고 오래 다닐 수 있는 곳" },
    optionB: { label: "빡세지만 크게 성장할 수 있는 곳" },
    resultA: 46, resultB: 54, totalVotes: 467,
    reasons: [
      { side: "A", text: "안정이 진짜 사치임", likes: 38 },
      { side: "B", text: "젊을 때 성장판 닫히기 전에", likes: 42 },
    ],
  },
];

/**
 * Feed questions — starter 이후에 셔플되어 노출되는 질문 풀.
 * 참여형 톤, 설문형 금지.
 */
export const FEED_QUESTIONS: Question[] = [
  // --- 음식 ---
  {
    id: "ex-01", qtype: "Snack", axis: null,
    valueA: "야식파", valueB: "갓생러",
    displayType: "text", category: "음식", categoryEmoji: "🍜",
    topic: "self", tension: "present_vs_future",
    question: "야식 먹고 후회한 적 있어?",
    optionA: { label: "후회해도 또 먹음" },
    optionB: { label: "그래서 안 먹기로 했음" },
    resultA: 58, resultB: 42, totalVotes: 334,
    reasons: [
      { side: "A", text: "후회가 야식 맛의 일부", likes: 31 },
      { side: "B", text: "다음 날 컨디션이 증명함", likes: 27 },
    ],
  },
  {
    id: "ex-02", qtype: "Snack", axis: null,
    valueA: "맵단짠러", valueB: "디저트덕후",
    displayType: "text", category: "음식", categoryEmoji: "🍜",
    topic: "self", tension: "present_vs_future",
    question: "점심 후 디저트는?",
    optionA: { label: "배부른데 굳이 안 먹음" },
    optionB: { label: "디저트는 별도 위장" },
    resultA: 41, resultB: 59, totalVotes: 356,
    reasons: [
      { side: "A", text: "칼로리가 무서움", likes: 25 },
      { side: "B", text: "디저트 빠지면 점심이 아님", likes: 38 },
    ],
  },
  // --- 소비 ---
  {
    id: "ex-03", qtype: "Snack", axis: null,
    valueA: "충동구매러", valueB: "가성비파",
    displayType: "text", category: "소비", categoryEmoji: "💸",
    topic: "money", tension: "present_vs_future",
    question: "세일 알림이 떴다",
    optionA: { label: "일단 장바구니 담는다" },
    optionB: { label: "진짜 필요한지 먼저 생각" },
    resultA: 47, resultB: 53, totalVotes: 389,
    reasons: [
      { side: "A", text: "고민하면 품절됨", likes: 34 },
      { side: "B", text: "충동구매 후회 학습 완료", likes: 31 },
    ],
  },
  {
    id: "ex-04", qtype: "Snack", axis: null,
    valueA: "플렉서", valueB: "가성비파",
    displayType: "text", category: "소비", categoryEmoji: "💸",
    topic: "relationship", tension: "care_vs_principle",
    question: "친구 생일 선물 고를 때",
    optionA: { label: "비싸더라도 좋은 걸로" },
    optionB: { label: "가격 대비 센스 있게" },
    resultA: 44, resultB: 56, totalVotes: 412,
    reasons: [
      { side: "A", text: "받는 사람이 알아봄", likes: 29 },
      { side: "B", text: "마음이 중요하지 가격이 중요한가", likes: 35 },
    ],
  },
  {
    id: "ex-05", qtype: "Snack", axis: null,
    valueA: "신상헌터", valueB: "가성비파",
    displayType: "text", category: "소비", categoryEmoji: "💸",
    topic: "money", tension: "present_vs_future",
    question: "새 아이폰 나왔다",
    optionA: { label: "출시일에 바꾼다" },
    optionB: { label: "내 폰 아직 멀쩡한데" },
    resultA: 32, resultB: 68, totalVotes: 478,
    reasons: [
      { side: "A", text: "카메라 차이가 체감됨", likes: 28 },
      { side: "B", text: "100만 원이면 여행 감", likes: 44 },
    ],
  },
  // --- 관계 ---
  {
    id: "ex-08", qtype: "Snack", axis: null,
    valueA: "갓생러", valueB: "집콕러",
    displayType: "text", category: "관계", categoryEmoji: "💕",
    topic: "relationship", tension: "care_vs_principle",
    question: "읽씹 당하면?",
    optionA: { label: "한 번 더 보낸다" },
    optionB: { label: "기다린다" },
    resultA: 42, resultB: 58, totalVotes: 412,
    reasons: [
      { side: "A", text: "확인은 해야 마음이 편함", likes: 33 },
      { side: "B", text: "재촉하면 오히려 역효과", likes: 38 },
    ],
  },
  {
    id: "ex-09", qtype: "Snack", axis: null,
    valueA: "갓생러", valueB: "집콕러",
    displayType: "text", category: "관계", categoryEmoji: "💕",
    topic: "relationship", tension: "care_vs_principle",
    question: "카톡 먼저 보내는 편?",
    optionA: { label: "먼저 보냄" },
    optionB: { label: "기다림" },
    resultA: 44, resultB: 56, totalVotes: 378,
    reasons: [
      { side: "A", text: "기다리면 아무 일도 안 일어남", likes: 35 },
      { side: "B", text: "먼저 보내면 주도권 잃음", likes: 30 },
    ],
  },
  {
    id: "ex-10", qtype: "Snack", axis: null,
    valueA: "갓생러", valueB: "집콕러",
    displayType: "text", category: "관계", categoryEmoji: "💕",
    topic: "relationship", tension: "care_vs_principle",
    question: "싸운 후에 먼저 연락하는 편?",
    optionA: { label: "내가 먼저 함" },
    optionB: { label: "상대가 할 때까지 기다림" },
    resultA: 43, resultB: 57, totalVotes: 401,
    reasons: [
      { side: "A", text: "시간 끌면 더 꼬임", likes: 34 },
      { side: "B", text: "감정 정리 후가 진짜 대화", likes: 37 },
    ],
  },
  // --- 트렌드 ---
  {
    id: "ex-11", qtype: "Snack", axis: null,
    valueA: "숏폼중독", valueB: "갓생러",
    displayType: "text", category: "트렌드", categoryEmoji: "🔥",
    topic: "self", tension: "efficiency_vs_empathy",
    question: "MBTI 믿어?",
    optionA: { label: "꽤 맞더라" },
    optionB: { label: "재미일 뿐" },
    resultA: 47, resultB: 53, totalVotes: 487,
    reasons: [
      { side: "A", text: "주변 사람 보면 진짜 맞음", likes: 38 },
      { side: "B", text: "바넘 효과일 뿐", likes: 35 },
    ],
  },
  {
    id: "ex-12", qtype: "Snack", axis: null,
    valueA: "숏폼중독", valueB: "앱테크족",
    displayType: "text", category: "트렌드", categoryEmoji: "🔥",
    topic: "self", tension: "present_vs_future",
    question: "AI 써본 적 있어?",
    optionA: { label: "매일 씀" },
    optionB: { label: "거의 안 씀" },
    resultA: 52, resultB: 48, totalVotes: 445,
    reasons: [
      { side: "A", text: "안 쓰면 손해인 세상", likes: 37 },
      { side: "B", text: "아직 쓸 일이 없었음", likes: 29 },
    ],
  },
  // --- 소비/재테크 ---
  {
    id: "ex-13", qtype: "Snack", axis: null,
    valueA: "플렉서", valueB: "가성비파",
    displayType: "text", category: "소비", categoryEmoji: "💸",
    topic: "money", tension: "stability_vs_growth",
    question: "적금 vs 주식?",
    optionA: { label: "원금 보장 적금" },
    optionB: { label: "수익률 주식" },
    resultA: 48, resultB: 52, totalVotes: 467,
    reasons: [
      { side: "A", text: "원금 보장이 마음의 평화", likes: 36 },
      { side: "B", text: "적금 이자로는 못 따라감", likes: 40 },
    ],
  },
  {
    id: "ex-14", qtype: "Snack", axis: null,
    valueA: "플렉서", valueB: "가성비파",
    displayType: "text", category: "소비", categoryEmoji: "💸",
    topic: "money", tension: "stability_vs_growth",
    question: "월세 vs 전세?",
    optionA: { label: "월세" },
    optionB: { label: "전세" },
    resultA: 41, resultB: 59, totalVotes: 378,
    reasons: [
      { side: "A", text: "목돈 없어도 살 수 있음", likes: 30 },
      { side: "B", text: "월세는 그냥 사라지는 돈", likes: 38 },
    ],
  },
  // --- 썸/연애 ---
  {
    id: "ex-17", qtype: "Snack", axis: null,
    valueA: "충동구매러", valueB: "가성비파",
    displayType: "text", category: "관계", categoryEmoji: "💕",
    topic: "relationship", tension: "care_vs_principle",
    question: "썸 탈 때 더 끌리는 쪽",
    optionA: { label: "느낌이 와야 함" },
    optionB: { label: "조건도 중요" },
    resultA: 56, resultB: 44, totalVotes: 456,
    reasons: [
      { side: "A", text: "설레지 않으면 의미 없음", likes: 39 },
      { side: "B", text: "현실적인 조건도 사랑의 일부", likes: 32 },
    ],
  },
  {
    id: "ex-18", qtype: "Snack", axis: null,
    valueA: "갓생러", valueB: "집콕러",
    displayType: "text", category: "관계", categoryEmoji: "💕",
    topic: "relationship", tension: "privacy_vs_openness",
    question: "좋아하는 사람에게",
    optionA: { label: "먼저 고백한다" },
    optionB: { label: "시그널 더 확인한다" },
    resultA: 38, resultB: 62, totalVotes: 489,
    reasons: [
      { side: "A", text: "후회는 안 한 것에서 온다", likes: 42 },
      { side: "B", text: "관계 망치면 복구 불가", likes: 36 },
    ],
  },
  // --- 라이프 추가 ---
  {
    id: "ex-19", qtype: "Snack", axis: null,
    valueA: "갓생러", valueB: "야행성",
    displayType: "text", category: "라이프", categoryEmoji: "🌿",
    topic: "self", tension: "freedom_vs_responsibility",
    question: "자취 vs 부모님 집?",
    optionA: { label: "자취" },
    optionB: { label: "부모님 집" },
    resultA: 53, resultB: 47, totalVotes: 389,
    reasons: [
      { side: "A", text: "자유가 곧 행복", likes: 35 },
      { side: "B", text: "밥 해주는 사람이 최고", likes: 38 },
    ],
  },
  // --- 커리어 (가볍게) ---
  {
    id: "ex-22", qtype: "Snack", axis: null,
    valueA: "갓생러", valueB: "야행성",
    displayType: "text", category: "커리어", categoryEmoji: "💼",
    topic: "work", tension: "freedom_vs_responsibility",
    question: "일할 때 더 끌리는 쪽",
    optionA: { label: "자유도" },
    optionB: { label: "안정감" },
    resultA: 51, resultB: 49, totalVotes: 412,
    reasons: [
      { side: "A", text: "자유 없으면 숨 막힘", likes: 35 },
      { side: "B", text: "안정이 있어야 도전도 함", likes: 33 },
    ],
  },
  {
    id: "ex-23", qtype: "Snack", axis: null,
    valueA: "갓생러", valueB: "야행성",
    displayType: "text", category: "커리어", categoryEmoji: "💼",
    topic: "work", tension: "present_vs_future",
    question: "연봉 500 더 vs 매일 칼퇴",
    optionA: { label: "연봉 500 더" },
    optionB: { label: "매일 칼퇴" },
    resultA: 37, resultB: 63, totalVotes: 534,
    reasons: [
      { side: "A", text: "500이면 월 40만 원인데 큼", likes: 36 },
      { side: "B", text: "시간은 돈으로 못 삼", likes: 44 },
    ],
  },
  // === 추가 Core (축당 +2, 총 8개) ===
  // Action 축
  {
    id: "core-a2", qtype: "Core", axis: "Action", valueA: -10, valueB: 10,
    displayType: "text", category: "라이프", categoryEmoji: "🌿",
    topic: "manners", tension: "freedom_vs_responsibility",
    question: "약속 시간 30분 전, 나는",
    optionA: { label: "이미 도착해 있음" }, optionB: { label: "지금 나가면 되겠지" },
    resultA: 44, resultB: 56, totalVotes: 389,
    reasons: [
      { side: "A", text: "늦는 건 예의가 아님", likes: 33 },
      { side: "B", text: "일찍 가면 할 게 없음", likes: 37 },
    ],
  },
  {
    id: "core-a3", qtype: "Core", axis: "Action", valueA: -10, valueB: 10,
    displayType: "text", category: "라이프", categoryEmoji: "🌿",
    topic: "self", tension: "freedom_vs_responsibility",
    question: "냉장고 재료 떨어지면",
    optionA: { label: "미리 리스트 써서 장 봄" }, optionB: { label: "그때그때 눈에 보이는 거 삼" },
    resultA: 42, resultB: 58, totalVotes: 356,
    reasons: [
      { side: "A", text: "안 사면 또 시킴", likes: 28 },
      { side: "B", text: "장보기는 즉흥이 맞음", likes: 34 },
    ],
  },
  // Reward 축
  {
    id: "core-r2", qtype: "Core", axis: "Reward", valueA: -10, valueB: 10,
    displayType: "text", category: "소비", categoryEmoji: "💸",
    topic: "money", tension: "present_vs_future",
    question: "보너스 200만 원이 나왔다",
    optionA: { label: "여행 간다" }, optionB: { label: "투자한다" },
    resultA: 52, resultB: 48, totalVotes: 445,
    reasons: [
      { side: "A", text: "경험은 지금 해야 의미 있음", likes: 38 },
      { side: "B", text: "200이 300 되는 게 더 좋음", likes: 35 },
    ],
  },
  {
    id: "core-r3", qtype: "Core", axis: "Reward", valueA: -10, valueB: 10,
    displayType: "text", category: "소비", categoryEmoji: "💸",
    topic: "money", tension: "present_vs_future",
    question: "로또 1등 당첨되면 첫 행동",
    optionA: { label: "드림카부터 산다" }, optionB: { label: "일단 숨기고 재테크" },
    resultA: 41, resultB: 59, totalVotes: 512,
    reasons: [
      { side: "A", text: "인생 한 번인데", likes: 36 },
      { side: "B", text: "당첨금 절반은 세금인데 조용히 해야", likes: 42 },
    ],
  },
  // Relation 축
  {
    id: "core-e2", qtype: "Core", axis: "Relation", valueA: -10, valueB: 10,
    displayType: "text", category: "관계", categoryEmoji: "💕",
    topic: "relationship", tension: "privacy_vs_openness",
    question: "여행은 누구랑?",
    optionA: { label: "혼자가 편함" }, optionB: { label: "같이 가야 재밌음" },
    resultA: 43, resultB: 57, totalVotes: 423,
    reasons: [
      { side: "A", text: "내 페이스로 다니는 자유", likes: 35 },
      { side: "B", text: "추억은 나누는 거지", likes: 38 },
    ],
  },
  {
    id: "core-e3", qtype: "Core", axis: "Relation", valueA: -10, valueB: 10,
    displayType: "text", category: "관계", categoryEmoji: "💕",
    topic: "self", tension: "privacy_vs_openness",
    question: "고민 있을 때",
    optionA: { label: "혼자 정리한다" }, optionB: { label: "누군가한테 말한다" },
    resultA: 48, resultB: 52, totalVotes: 401,
    reasons: [
      { side: "A", text: "말해봐야 답은 내가 앎", likes: 33 },
      { side: "B", text: "말하면서 정리가 됨", likes: 36 },
    ],
  },
  // Motivation 축
  {
    id: "core-m2", qtype: "Core", axis: "Motivation", valueA: -10, valueB: 10,
    displayType: "text", category: "커리어", categoryEmoji: "💼",
    topic: "work", tension: "stability_vs_growth",
    question: "새로운 걸 배운다면",
    optionA: { label: "실용적인 자격증" }, optionB: { label: "해보고 싶었던 것" },
    resultA: 46, resultB: 54, totalVotes: 378,
    reasons: [
      { side: "A", text: "스펙이 돼야 의미 있음", likes: 31 },
      { side: "B", text: "하고 싶은 걸 해야 오래 함", likes: 37 },
    ],
  },
  {
    id: "core-m3", qtype: "Core", axis: "Motivation", valueA: -10, valueB: 10,
    displayType: "text", category: "커리어", categoryEmoji: "💼",
    topic: "self", tension: "stability_vs_growth",
    question: "지금 만족하는 삶 vs 더 큰 목표",
    optionA: { label: "지금도 충분히 좋음" }, optionB: { label: "더 높이 가고 싶음" },
    resultA: 45, resultB: 55, totalVotes: 434,
    reasons: [
      { side: "A", text: "행복은 비교하면 사라짐", likes: 37 },
      { side: "B", text: "성장이 멈추면 퇴보", likes: 35 },
    ],
  },
  // === 추가 Snack (부족 태그 보충) ===
  {
    id: "ex-26", qtype: "Snack", axis: null,
    valueA: "충동구매러", valueB: "앱테크족",
    displayType: "text", category: "소비", categoryEmoji: "💸",
    topic: "money", tension: "present_vs_future",
    question: "쿠폰 알림 울리면",
    optionA: { label: "바로 써야지" }, optionB: { label: "진짜 필요할 때 씀" },
    resultA: 54, resultB: 46, totalVotes: 367,
    reasons: [
      { side: "A", text: "안 쓰면 아까움", likes: 30 },
      { side: "B", text: "쿠폰에 끌려가면 결국 낭비", likes: 28 },
    ],
  },
  {
    id: "ex-27", qtype: "Snack", axis: null,
    valueA: "야행성", valueB: "갓생러",
    displayType: "text", category: "라이프", categoryEmoji: "🌿",
    topic: "self", tension: "freedom_vs_responsibility",
    question: "가장 생산적인 시간대",
    optionA: { label: "밤 10시 이후" }, optionB: { label: "아침 일찍" },
    resultA: 54, resultB: 46, totalVotes: 412,
    reasons: [
      { side: "A", text: "밤이 돼야 집중됨", likes: 37 },
      { side: "B", text: "아침에 끝내야 하루가 편함", likes: 33 },
    ],
  },
  // === 논쟁형 질문 (갈리는 주제, topic/tension 포함) ===
  {
    id: "debate-02", qtype: "Snack", axis: null,
    valueA: "갓생러", valueB: "집콕러",
    displayType: "text", category: "관계", categoryEmoji: "💕",
    question: "친구가 거짓말한 걸 알았다. 말해?",
    optionA: { label: "직접 말한다" }, optionB: { label: "모른 척한다" },
    resultA: 53, resultB: 47, totalVotes: 389,
    reasons: [
      { side: "A", text: "알면서 모른 척하는 게 더 나쁨", likes: 36 },
      { side: "B", text: "괜히 관계만 어색해짐", likes: 33 },
    ],
    topic: "relationship", tension: "privacy_vs_openness",
  },
  {
    id: "debate-04", qtype: "Snack", axis: null,
    valueA: "갓생러", valueB: "집콕러",
    displayType: "text", category: "커리어", categoryEmoji: "💼",
    question: "팀 프로젝트에서 무임승차하는 동료, 말해?",
    optionA: { label: "직접 말한다" }, optionB: { label: "팀장한테 넘긴다" },
    resultA: 51, resultB: 49, totalVotes: 398,
    reasons: [
      { side: "A", text: "직접 말하는 게 빠르고 확실함", likes: 34 },
      { side: "B", text: "내가 싫은 소리 할 필요까지는 없잖아", likes: 32 },
    ],
    topic: "work", tension: "efficiency_vs_empathy",
  },
  {
    id: "debate-05", qtype: "Snack", axis: null,
    valueA: "플렉서", valueB: "가성비파",
    displayType: "text", category: "관계", categoryEmoji: "💕",
    question: "부모님이 연애 상대에 간섭한다",
    optionA: { label: "내 인생이니까 무시" }, optionB: { label: "일단 들어는 본다" },
    resultA: 47, resultB: 53, totalVotes: 445,
    reasons: [
      { side: "A", text: "내가 사귀는 건데 왜 간섭", likes: 37 },
      { side: "B", text: "경험에서 나오는 말이니까 참고는 함", likes: 39 },
    ],
    topic: "family", tension: "freedom_vs_responsibility",
  },
  {
    id: "debate-07", qtype: "Snack", axis: null,
    valueA: "핫플러", valueB: "집콕러",
    displayType: "text", category: "관계", categoryEmoji: "💕",
    question: "읽씹 vs 안읽씹, 뭐가 더 나빠?",
    optionA: { label: "읽씹이 더 나쁨" }, optionB: { label: "안읽씹이 더 나쁨" },
    resultA: 54, resultB: 46, totalVotes: 512,
    reasons: [
      { side: "A", text: "읽고 무시하는 건 의도적이잖아", likes: 40 },
      { side: "B", text: "안 읽는 건 존재 자체를 무시하는 거", likes: 36 },
    ],
    topic: "relationship", tension: "care_vs_principle",
  },
  {
    id: "debate-08", qtype: "Snack", axis: null,
    valueA: "갓생러", valueB: "야행성",
    displayType: "text", category: "커리어", categoryEmoji: "💼",
    question: "회사에서 부당한 지시를 받았다",
    optionA: { label: "거부한다" }, optionB: { label: "일단 따른다" },
    resultA: 49, resultB: 51, totalVotes: 434,
    reasons: [
      { side: "A", text: "부당한 건 부당한 거지", likes: 38 },
      { side: "B", text: "일단 하고 나중에 문제 제기", likes: 35 },
    ],
    topic: "work", tension: "freedom_vs_responsibility",
  },
];

// === 신규 현실 갈등형 (2026-04) ===
FEED_QUESTIONS.push(
  {
    id: "conflict-01", qtype: "Snack", axis: null,
    valueA: "직진파", valueB: "거리두기파",
    displayType: "text", category: "관계", categoryEmoji: "💕",
    topic: "relationship", tension: "fairness_vs_generosity",
    question: "연인이 친구들 술자리에 나를 안 불렀다, 더 가까운 쪽은?",
    optionA: { label: "서운하면 말한다" },
    optionB: { label: "친구 시간도 필요하다" },
    resultA: 51, resultB: 49, totalVotes: 0,
    reasons: [
      { side: "A", text: "말 안 하면 혼자 쌓임", likes: 0 },
      { side: "B", text: "연애가 전부가 아니잖아", likes: 0 },
    ],
  },
  {
    id: "conflict-02", qtype: "Snack", axis: null,
    valueA: "의리파", valueB: "원칙파",
    displayType: "text", category: "관계", categoryEmoji: "💕",
    topic: "family", tension: "freedom_vs_responsibility",
    question: "부모가 용돈을 달라고 한다, 더 가까운 쪽은?",
    optionA: { label: "당연히 드린다" },
    optionB: { label: "내 생활비가 먼저" },
    resultA: 49, resultB: 51, totalVotes: 0,
    reasons: [
      { side: "A", text: "키워주신 건데 그 정도는", likes: 0 },
      { side: "B", text: "내가 먼저 자리잡아야 효도도 함", likes: 0 },
    ],
  },
  {
    id: "conflict-03", qtype: "Snack", axis: null,
    valueA: "경계파", valueB: "맞춤파",
    displayType: "text", category: "커리어", categoryEmoji: "💼",
    topic: "work", tension: "freedom_vs_responsibility",
    question: "퇴근 후 상사 카톡, 더 가까운 쪽은?",
    optionA: { label: "퇴근은 퇴근, 내일 본다" },
    optionB: { label: "일 끝난 거 아니니까 본다" },
    resultA: 54, resultB: 46, totalVotes: 0,
    reasons: [
      { side: "A", text: "퇴근 이후 시간은 내 시간", likes: 0 },
      { side: "B", text: "급한 건 확인은 해야 함", likes: 0 },
    ],
  },
);

/** 전체 질문 풀 (starter 고정 + feed 셔플) */
export const SEED_QUESTIONS: Question[] = [...STARTER_QUESTIONS, ...FEED_QUESTIONS];

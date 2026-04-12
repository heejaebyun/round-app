import type { Question } from "@/lib/types";

/**
 * Philippines (en-PH) question pool.
 *
 * Starter: S S C S C S C S S C — same rhythm as KR/US.
 * Core 4 axis prompts adapted for Filipino Gen-Z context.
 * Snack 6 target PH 20–30s real-life tensions: family money,
 * utang na loob, romantic boundaries, work hierarchy.
 *
 * Feed: populated via approved candidates from question_candidates.
 */

export const PH_STARTER: Question[] = [
  // 1. Snack — family money lending
  {
    id: "ph-s01", qtype: "Snack", axis: null,
    valueA: "Loyal", valueB: "Principled",
    displayType: "text", category: "Money", categoryEmoji: "💸",
    topic: "family", tension: "fairness_vs_generosity",
    question: "Relative asks for a loan again — which side feels closer?",
    optionA: { label: "Help, they're family" },
    optionB: { label: "Set a boundary this time" },
    resultA: 48, resultB: 52, totalVotes: 0,
    reasons: [
      { side: "A", text: "Family is everything, you can't say no", likes: 0 },
      { side: "B", text: "Helping without limits hurts both sides", likes: 0 },
    ],
  },
  // 2. Snack — group dinner bill
  {
    id: "ph-s02", qtype: "Snack", axis: null,
    valueA: "Principled", valueB: "Adaptive",
    displayType: "text", category: "Money", categoryEmoji: "💸",
    topic: "manners", tension: "fairness_vs_generosity",
    question: "Group dinner, you only had water — split evenly or pay what you ate?",
    optionA: { label: "Pay only what I ordered" },
    optionB: { label: "Just split, it's less awkward" },
    resultA: 53, resultB: 47, totalVotes: 0,
    reasons: [
      { side: "A", text: "Why should I pay for what I didn't eat?", likes: 0 },
      { side: "B", text: "It's not worth the awkward math", likes: 0 },
    ],
  },
  // 3. Core — Action axis
  {
    id: "ph-c01", qtype: "Core", axis: "Action",
    valueA: -10, valueB: 10,
    displayType: "text", category: "Lifestyle", categoryEmoji: "🌿",
    topic: "self", tension: "freedom_vs_responsibility",
    question: "Planning a weekend trip — which is you?",
    optionA: { label: "Itinerary ready days before" },
    optionB: { label: "Figure it out when we get there" },
    resultA: 44, resultB: 56, totalVotes: 0,
    reasons: [
      { side: "A", text: "No plan means wasted time", likes: 0 },
      { side: "B", text: "The best moments are unplanned", likes: 0 },
    ],
  },
  // 4. Snack — parents disapprove of partner
  {
    id: "ph-s03", qtype: "Snack", axis: null,
    valueA: "Direct", valueB: "Diplomatic",
    displayType: "text", category: "Relationships", categoryEmoji: "💕",
    topic: "family", tension: "freedom_vs_responsibility",
    question: "Your parents don't approve of who you're dating — which feels closer?",
    optionA: { label: "My life, my choice" },
    optionB: { label: "Their opinion matters, hear them out" },
    resultA: 49, resultB: 51, totalVotes: 0,
    reasons: [
      { side: "A", text: "I know what's best for me", likes: 0 },
      { side: "B", text: "They've seen more than I have", likes: 0 },
    ],
  },
  // 5. Core — Reward axis
  {
    id: "ph-c02", qtype: "Core", axis: "Reward",
    valueA: -10, valueB: 10,
    displayType: "text", category: "Money", categoryEmoji: "💸",
    topic: "money", tension: "present_vs_future",
    question: "13th month pay just landed — which is you?",
    optionA: { label: "Treat myself, I worked for it" },
    optionB: { label: "Save or invest it" },
    resultA: 46, resultB: 54, totalVotes: 0,
    reasons: [
      { side: "A", text: "You only live once", likes: 0 },
      { side: "B", text: "Future me needs this more", likes: 0 },
    ],
  },
  // 6. Snack — sending money to parents
  {
    id: "ph-s04", qtype: "Snack", axis: null,
    valueA: "Loyal", valueB: "Realist",
    displayType: "text", category: "Money", categoryEmoji: "💸",
    topic: "family", tension: "care_vs_principle",
    question: "Parents expect a monthly padala — which feels closer?",
    optionA: { label: "Of course, it's my duty" },
    optionB: { label: "I need to secure myself first" },
    resultA: 50, resultB: 50, totalVotes: 0,
    reasons: [
      { side: "A", text: "They sacrificed everything for me", likes: 0 },
      { side: "B", text: "I can't pour from an empty cup", likes: 0 },
    ],
  },
  // 7. Core — Relation axis
  {
    id: "ph-c03", qtype: "Core", axis: "Relation",
    valueA: -10, valueB: 10,
    displayType: "text", category: "Relationships", categoryEmoji: "💕",
    topic: "self", tension: "privacy_vs_openness",
    question: "Stressed out after a long day — which is you?",
    optionA: { label: "Need alone time to recharge" },
    optionB: { label: "Call a friend, talk it out" },
    resultA: 48, resultB: 52, totalVotes: 0,
    reasons: [
      { side: "A", text: "I process things better alone", likes: 0 },
      { side: "B", text: "Keeping it in makes it worse", likes: 0 },
    ],
  },
  // 8. Snack — boss after hours
  {
    id: "ph-s05", qtype: "Snack", axis: null,
    valueA: "Private", valueB: "Adaptive",
    displayType: "text", category: "Work", categoryEmoji: "💼",
    topic: "work", tension: "freedom_vs_responsibility",
    question: "Boss messages you at 10pm on a weekday — which feels closer?",
    optionA: { label: "I'm off the clock, reply tomorrow" },
    optionB: { label: "Better check, might be important" },
    resultA: 47, resultB: 53, totalVotes: 0,
    reasons: [
      { side: "A", text: "Boundaries exist for a reason", likes: 0 },
      { side: "B", text: "Ignoring might cause bigger problems", likes: 0 },
    ],
  },
  // 9. Snack — LDR communication
  {
    id: "ph-s06", qtype: "Snack", axis: null,
    valueA: "Open", valueB: "Reserved",
    displayType: "text", category: "Relationships", categoryEmoji: "💕",
    topic: "relationship", tension: "privacy_vs_openness",
    question: "Your long-distance partner wants daily video calls — which feels closer?",
    optionA: { label: "Sweet, I'd love that" },
    optionB: { label: "That's a bit much for me" },
    resultA: 49, resultB: 51, totalVotes: 0,
    reasons: [
      { side: "A", text: "Distance needs extra effort", likes: 0 },
      { side: "B", text: "Too much can feel suffocating", likes: 0 },
    ],
  },
  // 10. Core — Motivation axis
  {
    id: "ph-c04", qtype: "Core", axis: "Motivation",
    valueA: -10, valueB: 10,
    displayType: "text", category: "Work", categoryEmoji: "💼",
    topic: "work", tension: "stability_vs_growth",
    question: "Two job offers — which is you?",
    optionA: { label: "Stable pay, close to home" },
    optionB: { label: "Higher ceiling, but way harder" },
    resultA: 48, resultB: 52, totalVotes: 0,
    reasons: [
      { side: "A", text: "Peace of mind is underrated", likes: 0 },
      { side: "B", text: "I'm young, I should push now", likes: 0 },
    ],
  },
];

export const PH_FEED: Question[] = [];
export const PH_SEED: Question[] = [...PH_STARTER, ...PH_FEED];

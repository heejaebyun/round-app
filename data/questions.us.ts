import type { Question } from "@/lib/types";

/**
 * US (en-US) question pool.
 *
 * Starter: S S C S C S C S S C — same rhythm as KR.
 * Core 4 (Action/Reward/Relation/Motivation) use English prompts
 * that map to the same axis.
 * Snack 6 target US 20–30s real-life conflicts.
 *
 * Feed: populated via approved candidates from question_candidates
 * table (research pipeline → admin approve → dynamic merge).
 */

export const US_STARTER: Question[] = [
  // 1. Snack — tipping culture
  {
    id: "us-s01", qtype: "Snack", axis: null,
    valueA: "Courteous", valueB: "Principled",
    displayType: "text", category: "Money", categoryEmoji: "💸",
    topic: "manners", tension: "fairness_vs_generosity",
    question: "20% tip on a mediocre meal — which side feels closer?",
    optionA: { label: "Still tip 20%, it's the norm" },
    optionB: { label: "Tip less, service matters" },
    resultA: 52, resultB: 48, totalVotes: 0,
    reasons: [
      { side: "A", text: "Servers depend on tips regardless", likes: 0 },
      { side: "B", text: "Tipping shouldn't reward bad service", likes: 0 },
    ],
  },
  // 2. Snack — texting back
  {
    id: "us-s02", qtype: "Snack", axis: null,
    valueA: "Direct", valueB: "Reserved",
    displayType: "text", category: "Relationships", categoryEmoji: "💕",
    topic: "relationship", tension: "care_vs_principle",
    question: "They left you on read for 6 hours — which feels closer?",
    optionA: { label: "Double-text, life's too short" },
    optionB: { label: "Wait it out, don't chase" },
    resultA: 45, resultB: 55, totalVotes: 0,
    reasons: [
      { side: "A", text: "Overthinking wastes more energy", likes: 0 },
      { side: "B", text: "If they wanted to reply, they would", likes: 0 },
    ],
  },
  // 3. Core — Action axis
  {
    id: "us-c01", qtype: "Core", axis: "Action",
    valueA: -10, valueB: 10,
    displayType: "text", category: "Lifestyle", categoryEmoji: "🌿",
    topic: "self", tension: "freedom_vs_responsibility",
    question: "Packing for a trip — which is you?",
    optionA: { label: "Checklist a week early" },
    optionB: { label: "Throw stuff in the night before" },
    resultA: 47, resultB: 53, totalVotes: 0,
    reasons: [
      { side: "A", text: "Forgetting something ruins the trip", likes: 0 },
      { side: "B", text: "You can buy whatever you forget", likes: 0 },
    ],
  },
  // 4. Snack — rent vs experiences
  {
    id: "us-s03", qtype: "Snack", axis: null,
    valueA: "Planner", valueB: "Spontaneous",
    displayType: "text", category: "Money", categoryEmoji: "💸",
    topic: "money", tension: "present_vs_future",
    question: "$200 left after bills — which feels closer?",
    optionA: { label: "Save it, build the cushion" },
    optionB: { label: "Live a little, you earned it" },
    resultA: 51, resultB: 49, totalVotes: 0,
    reasons: [
      { side: "A", text: "Future you will thank you", likes: 0 },
      { side: "B", text: "You can't take it with you", likes: 0 },
    ],
  },
  // 5. Core — Reward axis
  {
    id: "us-c02", qtype: "Core", axis: "Reward",
    valueA: -10, valueB: 10,
    displayType: "text", category: "Money", categoryEmoji: "💸",
    topic: "money", tension: "present_vs_future",
    question: "Surprise $1,000 bonus — which is you?",
    optionA: { label: "Spend it now, treat yourself" },
    optionB: { label: "Invest it, let it grow" },
    resultA: 44, resultB: 56, totalVotes: 0,
    reasons: [
      { side: "A", text: "Life is short, enjoy the moment", likes: 0 },
      { side: "B", text: "$1K invested now is $3K later", likes: 0 },
    ],
  },
  // 6. Snack — friend lending money
  {
    id: "us-s04", qtype: "Snack", axis: null,
    valueA: "Loyal", valueB: "Principled",
    displayType: "text", category: "Relationships", categoryEmoji: "💕",
    topic: "relationship", tension: "fairness_vs_generosity",
    question: "Close friend asks to borrow $500 — which feels closer?",
    optionA: { label: "Help them out, that's what friends do" },
    optionB: { label: "Money and friendship don't mix" },
    resultA: 42, resultB: 58, totalVotes: 0,
    reasons: [
      { side: "A", text: "I'd want someone to help me too", likes: 0 },
      { side: "B", text: "Lending money always gets weird", likes: 0 },
    ],
  },
  // 7. Core — Relation axis
  {
    id: "us-c03", qtype: "Core", axis: "Relation",
    valueA: -10, valueB: 10,
    displayType: "text", category: "Relationships", categoryEmoji: "💕",
    topic: "relationship", tension: "privacy_vs_openness",
    question: "Worst day ever, finally home — which is you?",
    optionA: { label: "Decompress alone, recharge" },
    optionB: { label: "Call someone and vent" },
    resultA: 52, resultB: 48, totalVotes: 0,
    reasons: [
      { side: "A", text: "Alone time is how I reset", likes: 0 },
      { side: "B", text: "Talking it out is the only way", likes: 0 },
    ],
  },
  // 8. Snack — workplace boundary
  {
    id: "us-s05", qtype: "Snack", axis: null,
    valueA: "Private", valueB: "Adaptive",
    displayType: "text", category: "Work", categoryEmoji: "💼",
    topic: "work", tension: "freedom_vs_responsibility",
    question: "Boss texts you on a Sunday — which feels closer?",
    optionA: { label: "Ignore until Monday" },
    optionB: { label: "At least check what it says" },
    resultA: 54, resultB: 46, totalVotes: 0,
    reasons: [
      { side: "A", text: "Weekends are mine, period", likes: 0 },
      { side: "B", text: "Could be urgent, quick check won't hurt", likes: 0 },
    ],
  },
  // 9. Snack — dating honesty
  {
    id: "us-s06", qtype: "Snack", axis: null,
    valueA: "Direct", valueB: "Diplomatic",
    displayType: "text", category: "Relationships", categoryEmoji: "💕",
    topic: "relationship", tension: "honesty_vs_harmony",
    question: "Not feeling the spark after 3 dates — which feels closer?",
    optionA: { label: "Tell them straight up" },
    optionB: { label: "Slow fade, less awkward" },
    resultA: 48, resultB: 52, totalVotes: 0,
    reasons: [
      { side: "A", text: "They deserve honesty", likes: 0 },
      { side: "B", text: "A direct rejection stings more", likes: 0 },
    ],
  },
  // 10. Core — Motivation axis
  {
    id: "us-c04", qtype: "Core", axis: "Motivation",
    valueA: -10, valueB: 10,
    displayType: "text", category: "Work", categoryEmoji: "💼",
    topic: "work", tension: "stability_vs_growth",
    question: "Two job offers on the table — which is you?",
    optionA: { label: "Stable, good benefits, chill pace" },
    optionB: { label: "Intense but huge growth potential" },
    resultA: 46, resultB: 54, totalVotes: 0,
    reasons: [
      { side: "A", text: "Stability is underrated", likes: 0 },
      { side: "B", text: "Growth now pays off forever", likes: 0 },
    ],
  },
];

export const US_FEED: Question[] = [];
export const US_SEED: Question[] = [...US_STARTER, ...US_FEED];

# Round US Launch Roadmap

## 1. Objective

Round's US launch is **not** a separate product.
It is a **market expansion experiment on the same product**, using a US-specific tension dataset.

Core principle:

> same product, same brand, same codebase, different localized tension dataset

This means:
- brand stays `Round`
- domain stays one
- codebase stays one
- product loop stays one
- US questions are **not translations** of Korean questions

## 2. Market Definition

Do not define this as a generic "English market" launch.
Treat it as a **US dataset launch** first.

### Primary market
- United States

### First target segment
- age: `22–32`
- English-speaking
- urban / early-career professionals
- already familiar with:
  - Reddit-style debate
  - AITA-style moral ambiguity
  - TikTok-like fast feed consumption

### Why the US first
- strong culture of social dilemma discussion
- high tolerance for short-form opinion content
- strong habit of reading reasoning and comments
- large supply of real-world everyday tension

## 3. Product Positioning in the US

Round is **not** positioned as a personality test app.

US positioning:

> A debate feed for everyday situations people already disagree on

Alternative shorter line:

> Pick a side. See why people disagree.

Do not lead with DNA.
Lead with:
- choice
- split
- reasoning
- thread

DNA remains a secondary reward layer.

## 4. Product Scope

The US launch should use the same core loop:

1. see a question
2. pick a side
3. see the split
4. read both sides' reasons
5. go deeper via thread
6. continue to next question

Keep the current structure.
Do not create a US-only product fork.

## 5. URL and Locale Structure

Recommended structure:

- `/ko`
- `/en`

### Locale rules
- browser language detection suggests the initial locale
- user explicitly confirms language on first visit
- preference is saved

Store:
- localStorage
- cookie
- user profile later if needed

Example:
- `preferred_locale = ko`
- `preferred_locale = en`

## 6. Dataset Strategy

This is the most important rule:

> US questions must be built from US social tension, not translated from Korean tension.

### Korean examples
- wedding cash gifts
- group chat read-receipts
- company dinner etiquette

### US examples
- split the bill
- wedding registry etiquette
- workplace boundaries
- roommate rules
- texting expectations
- family holiday obligation
- honesty vs politeness

## 7. Content Sourcing

Use these as source pools:
- Reddit
- AITA-like dilemmas
- relationship advice content
- workplace advice / boundary conflicts
- etiquette and money disputes
- daily social tension topics

### Important rule
Never copy source text directly.

Process:
1. extract tension structure
2. remove identifiable details
3. generalize
4. rewrite into Round question format

## 8. US Question Design Rules

Questions should be:
- realistic
- socially familiar
- easy to answer in one tap
- difficult to answer with certainty
- easy to justify in one sentence

Avoid:
- ragebait-only prompts
- gender-war bait
- legal-risk wording
- culture-specific Korean framing translated into English
- overly abstract philosophy prompts

## 9. US Question Categories

Start with these high-fit categories:
- relationship
- money
- manners
- work
- family
- self

### Strong early tension areas
- split the bill
- wedding expectations
- texting / reply etiquette
- honesty vs keeping peace
- boundaries in friendship
- roommates and shared responsibility
- workplace fairness
- personal privacy vs openness

## 10. KPI Rules

US metrics must be separated from Korean metrics.

Do not combine `ko` and `en` behavior in one dashboard view.

Track separately:
- first question select rate
- reason click-through rate
- next question rate
- 3-question reach
- 5-question reach
- thread entry rate
- share rate
- split score

### Most important KPI
- `split score`

US success depends heavily on whether questions genuinely polarize users.

## 11. Launch Phases

### Phase 1 — Internal dataset build
- define initial US question set
- create 30–50 US questions
- prioritize strong real-world tension questions
- validate wording quality and tone

### Phase 2 — Small closed test
- soft launch to a small English-speaking group
- test feed loop only
- verify:
  - select rate
  - reason reading
  - next question movement
  - thread curiosity

### Phase 3 — Public traffic test
- push `/en` traffic intentionally
- test with lightweight growth channels
- compare `ko` vs `en` metrics separately

### Phase 4 — Question operating system
- start ranking US questions by:
  - split score
  - reason CTR
  - next rate
  - thread entry

### Phase 5 — Expansion decision
- only after the US dataset shows survival:
  - consider UK
  - consider Singapore as a smaller testbed

## 12. What Not to Do

- do not translate Korean questions directly
- do not launch "English" as one undifferentiated market
- do not lead with DNA in the US
- do not expand to multiple English-speaking regions at once
- do not create a separate codebase or brand fork

## 13. One-Line Strategy

> Round expands to the US by launching a localized US tension dataset on the same product, not by translating Korean questions into English.


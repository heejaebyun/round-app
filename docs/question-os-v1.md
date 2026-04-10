# Round Question OS v1.1

## Definition

Round is not a question creation platform.
Round is a system that:

1. detects real-world social tension,
2. translates that tension into structured questions,
3. ships those questions into the feed,
4. lets user behavior decide which questions survive.

Core principle:

> Questions are not invented from scratch.
> They are structured expressions of tension that already exists in the world.

---

## Product Role of the Question OS

The Question OS exists to make the feed stronger.

It should help Round answer:

- what kinds of questions should enter the feed,
- which questions should stay alive,
- which questions should be archived,
- what kinds of tensions are missing,
- what kinds of tensions produce high split and strong reason consumption.

The Question OS is not a full recommendation engine yet.
It is the first operating layer for sourcing, tagging, testing, and scoring questions.

---

## v1 Scope

Question OS v1 should stay intentionally small.

It should include:

- structured question metadata,
- lightweight source tracking,
- question lifecycle states,
- split-based evaluation,
- early survival scoring,
- AI-assisted generation and tagging,
- manual operator review before publication.

It should not yet include:

- full knowledge graph infrastructure,
- automated reinforcement learning,
- advanced segment routing,
- fully dynamic ranking models,
- real-time source weighting optimization.

---

## Core Data Model

Each question should be treated as structured tension data, not just content text.

Question metadata should be split into two groups.

### A. AI-tagged semantic fields

- `topic`
- `subtopic`
- `tension`
- `stakes`
- `emotion_tag`
- `risk_tag`
- `audience_hint`
- `locale`
- `source_type`

### B. System-computed operating fields

- `status`
- `split_score`
- `heat_score`
- `longevity_score`

Recommended shape:

```json
{
  "topic": "relationship",
  "subtopic": "friendship",
  "tension": "honesty_vs_harmony",
  "stakes": "social",
  "emotion_tag": ["awkward", "anxiety"],
  "risk_tag": ["sensitive"],
  "audience_hint": ["KR_20s"],
  "locale": "ko-KR",
  "source_type": "community",
  "status": "test",
  "split_score": 0.0,
  "heat_score": 0.0,
  "longevity_score": 0.0
}
```

---

## Metadata Definitions

### 1. topic

Top-level domain of the question.

Recommended v1 values:

- `relationship`
- `money`
- `manners`
- `work`
- `family`
- `self`
- `lifestyle`
- `society`

### 2. subtopic

Specific area inside the topic.

Examples:

- `friendship`
- `dating`
- `wedding_gift`
- `boss_boundary`
- `roommate`
- `parents`

### 3. tension

The central conflict axis.
This is the most important field.

Recommended v1 values:

- `honesty_vs_harmony`
- `fairness_vs_generosity`
- `freedom_vs_responsibility`
- `stability_vs_growth`
- `privacy_vs_openness`
- `present_vs_future`
- `efficiency_vs_empathy`

### 4. stakes

How heavy the question feels.

Recommended v1 values:

- `low`
- `social`
- `identity`
- `financial`

### 5. emotion_tag

Primary emotions likely to power response, reason viewing, or reply behavior.

Examples:

- `awkward`
- `guilt`
- `anger`
- `anxiety`
- `pressure`
- `pride`
- `rejection`

This matters because the same tension can behave very differently depending on emotional texture.

Examples:

- wedding gift amount -> `awkward`, `pressure`
- leaving someone on read -> `anxiety`, `rejection`
- splitting the bill -> `fairness`, `pride`

### 6. risk_tag

Operational risk marker.

Recommended v1 values:

- `ragebait`
- `gender_war`
- `political`
- `defamation_risk`
- `too_niche`
- `sensitive`

### 7. audience_hint

Operator hint for likely segment fit.
This should start as a light-weight tagging field, not a hard routing rule.

Examples:

- `KR_20s`
- `office_workers`
- `US_20s`
- `young_professionals`

### 8. locale

Locale owner of the question dataset.

Examples:

- `ko-KR`
- `en-US`
- `en-GB`

Round should expand by locale dataset, not by direct translation of the same question bank.

### 9. source_type

Where the question idea came from.

Recommended v1 values:

- `community`
- `news_comment`
- `internal_submission`
- `manual_editorial`

### 10. status

Question lifecycle state.

Recommended v1 values:

- `test`
- `rising`
- `evergreen`
- `archive`

### 11. split_score

System-computed score that measures how evenly a question divides users.

This should not be manually assigned by AI.

### 12. heat_score

System-computed score representing how hot a question is right now.

Examples of contributors:

- recent vote acceleration,
- recent reason-click acceleration,
- recent reply acceleration.

### 13. longevity_score

System-computed score representing how consistently a question performs over time.

This helps separate:

- currently hot questions,
- evergreen questions that always work.

---

## Source Collection Rule

Sources are reference material, not copy material.

Allowed source families:

- community posts
- comment sections
- everyday social friction
- internal user submissions

Mandatory process:

1. detect tension,
2. extract the conflict structure,
3. anonymize,
4. generalize,
5. rewrite as a clean binary question.

Never:

- copy original post text directly,
- preserve identifiable details,
- ship raw community drama into the feed.

---

## AI Role in v1

AI is not the final author.
AI is used for:

1. generating candidate questions,
2. tagging those candidates with metadata,
3. helping operators compare variants.

Recommended pipeline:

1. source collected,
2. conflict structure summarized,
3. AI generates 10 to 20 candidate questions,
4. AI assigns metadata,
5. operator approves 3 to 5 candidates,
6. feed test begins.

AI should produce:

- question text,
- option A / option B wording,
- topic,
- subtopic,
- tension,
- stakes,
- emotion_tag,
- risk_tag proposal,
- audience_hint,
- locale.

AI should **not** be the source of truth for:

- `split_score`
- `heat_score`
- `longevity_score`
- `status`

Those must be system or operator-owned operating fields.

---

## Survival Logic

Questions should not live or die based on taste alone.
They should be evaluated by user behavior.

v1 survival signals:

- vote count
- reason click-through rate
- reply rate
- next-question rate
- split score

Supporting operating signals:

- `heat_score`
- `longevity_score`

Suggested v1 survival mix:

- `vote_count`: 25
- `reason_ctr`: 20
- `reply_rate`: 15
- `next_rate`: 15
- `split_score`: 25

This reflects Round’s product truth:

> the best question is not just popular,
> it is meaningfully split and pulls people into reasons.

---

## Split Score

Round should explicitly track how evenly a question divides users.

Interpretation:

- near `50:50` = strongest
- highly one-sided = weaker for Round’s feed

Simple v1 grading:

- `49:51 ~ 45:55` -> S
- `40:60 ~ 60:40` -> A
- `30:70 ~ 70:30` -> B
- more one-sided -> archive candidate

Split score should influence:

- question survival,
- ranking later,
- future AI prompt tuning.

---

## Heat vs Longevity

Round should track two different strengths:

### Heat

How hot a question is right now.

Examples:

- sudden current-event tension,
- new social discourse,
- rapidly growing replies.

### Longevity

How consistently a question works over time.

Examples:

- wedding gift amount,
- leaving someone on read,
- splitting the bill,
- late friends.

v1 does not need a full predictive model yet.
But both should already exist as explicit operating fields:

- `heat_score`
- `longevity_score`

This lets operators distinguish:

- “what is hot now”
- “what always works”

---

## Lifecycle

Every question should move through a clear lifecycle.

### test

Freshly introduced question.

### rising

Strong early signals.
Good split, good reason consumption, strong next-question continuation.

### evergreen

Reliable long-term performer.
Still useful for cold start and stable feed quality.

### archive

Weak question or overly one-sided question.
Still useful for learning, but not active in the main feed.

---

## Operator Rules

Editors should judge candidates with these questions:

- is this realistic?
- do both sides have a valid logic?
- does it invite one-line justification?
- does it feel socially familiar?
- is it sharp without becoming exhausting?

Avoid:

- pure ragebait,
- obvious answers,
- overly abstract scenarios,
- overly niche context,
- low-context survey phrasing.

---

## What v1 Enables

Once this system exists, Round can support:

- stronger question sourcing,
- cleaner feed experimentation,
- better survival decisions,
- future behavior profile inputs,
- future US dataset launch,
- future routing by topic, tension, emotion, and locale.

This is why Question OS matters:

> it turns the question pool from content inventory into structured tension inventory.

---

## One-line Summary

Round Question OS v1.1 is:

> a lightweight operating system that converts real-world social tension into structured, locale-aware feed questions, then uses split and reason behavior to decide which questions survive.

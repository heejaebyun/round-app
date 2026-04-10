# Question OS — Operations Guide

## Running Metrics Updates

### Single question
```bash
curl -X POST https://round-app-one.vercel.app/api/internal/question-metrics \
  -H "Content-Type: application/json" \
  -d '{"questionId": "d1-01"}'
```

### Batch update (all active questions)
```bash
curl -X POST https://round-app-one.vercel.app/api/internal/question-metrics \
  -H "Content-Type: application/json" \
  -d '{"batch": true}'
```

If `INTERNAL_API_KEY` env is set, add:
```
-H "x-internal-key: YOUR_KEY"
```

## Inspecting Question State

### Single question
```bash
curl "https://round-app-one.vercel.app/api/internal/question-inspect?id=d1-01"
```

Returns: ops metrics, derived status, feedback summary, raw snapshot.

### All questions summary
```bash
curl "https://round-app-one.vercel.app/api/internal/question-inspect?all=true"
```

Returns: all questions sorted by heat, with status counts.

## Question Candidates Admin

- Admin page: `/admin/questions`
- Enter `INTERNAL_API_KEY` once in the admin page
- Create a candidate
- Approve it
- Approved candidates are merged into the runtime feed without a code deploy
- Run metrics batch from the admin page
- Inspect status cards / question score table
- Moderate recent replies from the same page

Internal APIs:

### List / create candidates
```bash
curl "https://round-app-one.vercel.app/api/internal/question-candidates?status=pending" \
  -H "x-internal-key: YOUR_KEY"
```

```bash
curl -X POST "https://round-app-one.vercel.app/api/internal/question-candidates" \
  -H "Content-Type: application/json" \
  -H "x-internal-key: YOUR_KEY" \
  -d '{"question":"친구가 계산을 애매하게 넘기면, 더 가까운 쪽은?","category":"관계","optionA":"바로 말한다","optionB":"그냥 넘긴다","valueA":"직설파","valueB":"완곡파","topic":"relationship","tension":"honesty_vs_harmony"}'
```

### Approve candidate
```bash
curl -X POST "https://round-app-one.vercel.app/api/internal/question-candidates/CANDIDATE_ID/approve" \
  -H "x-internal-key: YOUR_KEY"
```

### Reject candidate
```bash
curl -X POST "https://round-app-one.vercel.app/api/internal/question-candidates/CANDIDATE_ID/reject" \
  -H "x-internal-key: YOUR_KEY"
```

### Recent replies moderation
```bash
curl "https://round-app-one.vercel.app/api/internal/moderation/replies?limit=20" \
  -H "x-internal-key: YOUR_KEY"
```

```bash
curl -X DELETE "https://round-app-one.vercel.app/api/internal/moderation/replies/REPLY_ID" \
  -H "x-internal-key: YOUR_KEY"
```

## What the metrics mean

| Metric | Source | Meaning |
|--------|--------|---------|
| `splitScore` | votes | How evenly split (100 = 50:50) |
| `splitGrade` | splitScore | S/A/B/C rating |
| `reasonCtr` | reason_engaged / result_viewed | Active reason engagement rate |
| `replyRate` | replies / card_viewed | Thread participation rate |
| `nextRate` | next_clicked / card_viewed | Feed continuation rate |
| `heatScore` | recent 7d activity | How hot right now |
| `longevityScore` | all-time activity | Long-term consistency |

## Status derivation

| Status | Rule |
|--------|------|
| `archive` | weak split AND low engagement |
| `rising` | high heat AND strong engagement |
| `evergreen` | good split AND 10+ votes |
| `test` | default / not enough data |

## Feedback reasons

| Code | Label |
|------|-------|
| `too_obvious` | 답이 너무 뻔해요 |
| `too_provocative` | 너무 자극적이에요 |
| `weak_context` | 맥락이 약해요 |
| `too_similar` | 비슷한 질문이 많아요 |
| `not_interested` | 관심 없는 주제예요 |

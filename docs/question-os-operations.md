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

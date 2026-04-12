-- v2 Question OS quality signals
-- Applied 2026-04-12 via Supabase SQL Editor
alter table question_metrics_snapshot
  add column if not exists skip_rate smallint not null default 0,
  add column if not exists feedback_rate smallint not null default 0,
  add column if not exists reason_engagement_rate smallint not null default 0,
  add column if not exists quality_score smallint not null default 50;

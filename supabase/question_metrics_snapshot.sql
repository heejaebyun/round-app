-- Question-level performance metrics snapshot
-- Dynamic operating data, separate from static question metadata
create table if not exists question_metrics_snapshot (
  id uuid primary key default gen_random_uuid(),
  question_id text not null unique,
  vote_count int default 0,
  reason_ctr numeric(5,2) default 0,
  reply_rate numeric(5,2) default 0,
  next_rate numeric(5,2) default 0,
  split_score int default 0,
  split_grade text check (split_grade in ('S', 'A', 'B', 'C')) default 'C',
  heat_score numeric(5,2) default 0,
  longevity_score numeric(5,2) default 0,
  captured_at timestamptz default now()
);

alter table question_metrics_snapshot enable row level security;
create policy "Allow all question_metrics_snapshot" on question_metrics_snapshot
  for all using (true) with check (true);

create index if not exists idx_qms_question_id on question_metrics_snapshot(question_id);
create index if not exists idx_qms_split_grade on question_metrics_snapshot(split_grade);

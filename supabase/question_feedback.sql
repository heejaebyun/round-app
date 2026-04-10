-- Question quality feedback from users
create table if not exists question_feedback (
  id uuid primary key default gen_random_uuid(),
  question_id text not null,
  device_id text not null,
  reason text not null check (reason in (
    'too_obvious', 'too_provocative', 'weak_context', 'too_similar', 'not_interested'
  )),
  created_at timestamptz default now()
);

alter table question_feedback enable row level security;
create policy "Allow all question_feedback" on question_feedback for all using (true) with check (true);
create index if not exists idx_question_feedback_qid on question_feedback(question_id);

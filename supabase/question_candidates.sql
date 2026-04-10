create table if not exists question_candidates (
  id text primary key,
  review_status text not null check (review_status in ('pending', 'approved', 'rejected')) default 'pending',
  question text not null,
  display_type text not null check (display_type in ('text')) default 'text',
  category text not null,
  category_emoji text not null,
  option_a_label text not null,
  option_b_label text not null,
  value_a text not null,
  value_b text not null,
  topic text not null,
  subtopic text,
  tension text not null,
  stakes text,
  risk_tag text[] not null default '{}',
  emotion_tag text[] not null default '{}',
  audience_hint text[] not null default '{}',
  locale text not null default 'ko-KR',
  source_type text not null default 'manual_editorial',
  source_note text,
  result_a int not null default 50,
  result_b int not null default 50,
  total_votes int not null default 0,
  reasons jsonb not null default '[]'::jsonb,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_question_candidates_review_status on question_candidates(review_status);
create index if not exists idx_question_candidates_approved_at on question_candidates(approved_at desc);

alter table question_candidates enable row level security;

create policy "Public read approved question candidates"
on question_candidates
for select
using (review_status = 'approved');

-- ============================================
-- Round: reason_replies 테이블
-- Supabase SQL Editor에서 실행
-- ============================================

create table reason_replies (
  id uuid primary key default gen_random_uuid(),
  reason_id uuid not null references reasons(id) on delete cascade,
  device_id text not null,
  text text not null,
  tone text check (tone in ('agree', 'rebuttal', 'comment')) default 'comment',
  likes int default 0,
  created_at timestamptz default now()
);

-- RLS
alter table reason_replies enable row level security;
create policy "Allow all reason_replies" on reason_replies for all using (true) with check (true);

-- 인덱스: 특정 이유의 답글 조회용
create index idx_reason_replies_reason_id on reason_replies(reason_id);

-- ============================================
-- Round 운영 KPI 쿼리
-- Supabase SQL Editor에서 바로 실행 가능
-- ============================================

-- 1. 일자별 세션 수 (채널 구분)
select
  date(created_at) as day,
  event_data->>'channel' as channel,
  count(*) as sessions
from events
where event_name = 'session_start'
group by day, channel
order by day desc
limit 30;


-- 2. 세션당 평균 카드 수
-- (device_id + 날짜를 세션 단위로 근사)
select
  date(created_at) as day,
  round(count(*)::numeric / nullif(count(distinct device_id), 0), 1) as avg_cards_per_session
from events
where event_name = 'card_viewed'
group by day
order by day desc
limit 14;


-- 3. 첫 3카드 이후 이탈률
-- card_viewed가 3 이하인 세션 비율
with session_cards as (
  select
    device_id,
    date(created_at) as day,
    count(*) as cards
  from events
  where event_name = 'card_viewed'
  group by device_id, day
)
select
  day,
  count(*) as total_sessions,
  count(*) filter (where cards <= 3) as dropped_early,
  round(100.0 * count(*) filter (where cards <= 3) / nullif(count(*), 0)) as early_drop_pct
from session_cards
group by day
order by day desc
limit 14;


-- 4. 이유 작성률
-- (reason_written / choice_made)
with daily as (
  select
    date(created_at) as day,
    count(*) filter (where event_name = 'choice_made') as choices,
    count(*) filter (where event_name = 'reason_written') as reasons
  from events
  where event_name in ('choice_made', 'reason_written')
  group by day
)
select
  day,
  choices,
  reasons,
  round(100.0 * reasons / nullif(choices, 0)) as reason_rate_pct
from daily
order by day desc
limit 14;


-- 5. DNA 진입률
-- (dna_profile_viewed가 있는 디바이스 / session_start 디바이스)
with daily as (
  select
    date(created_at) as day,
    count(distinct device_id) filter (where event_name = 'session_start') as sessions,
    count(distinct device_id) filter (where event_name = 'dna_profile_viewed') as dna_views
  from events
  where event_name in ('session_start', 'dna_profile_viewed')
  group by day
)
select
  day,
  sessions,
  dna_views,
  round(100.0 * dna_views / nullif(sessions, 0)) as dna_entry_pct
from daily
order by day desc
limit 14;


-- 6. 총 투표/이유/이벤트 수 (전체 상태 확인)
select 'votes' as table_name, count(*) from votes
union all
select 'reasons', count(*) from reasons
union all
select 'events', count(*) from events;


-- 7. 채널별 투표 분포
select
  event_data->>'channel' as channel,
  count(*) as total_choices
from events
where event_name = 'choice_made'
group by channel;

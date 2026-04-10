-- Add selected_option_id to reason_replies
-- This tracks which option the reply author chose
alter table reason_replies add column if not exists selected_option_id text;

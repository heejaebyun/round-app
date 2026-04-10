import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Supabase 클라이언트 — env가 없으면 null (앱은 계속 동작)
let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // env 없이도 앱은 동작 — 로컬 데모 모드
    return null;
  }

  _client = createClient(url, key);
  return _client;
}

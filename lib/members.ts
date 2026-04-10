import type { RoundMember } from "./types";
import type { TossLoginSession } from "./toss-login";
import { getSupabase } from "./supabase";

type MemberRow = {
  id: string;
  toss_user_key: number;
  name: string | null;
  email: string | null;
  nickname: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string;
};

const MEMBER_COLS = "id, toss_user_key, name, email, nickname, created_at, updated_at, last_login_at";

function mapMember(row: MemberRow): RoundMember {
  return {
    id: row.id,
    tossUserKey: row.toss_user_key,
    name: row.name,
    email: row.email,
    nickname: row.nickname,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at,
  };
}

export function validateNickname(raw: string) {
  const nickname = raw.trim();

  if (nickname.length < 2 || nickname.length > 12) {
    return {
      ok: false as const,
      message: "닉네임은 2자 이상 12자 이하로 입력해주세요.",
    };
  }

  if (!/^[0-9A-Za-z가-힣_]+$/.test(nickname)) {
    return {
      ok: false as const,
      message: "닉네임은 한글, 영문, 숫자, 밑줄(_)만 사용할 수 있어요.",
    };
  }

  return { ok: true as const, nickname };
}

export async function getMemberByTossUserKey(userKey: number) {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from("members")
    .select(MEMBER_COLS)
    .eq("toss_user_key", userKey)
    .maybeSingle();

  if (error || !data) return null;
  return mapMember(data as MemberRow);
}

export async function ensureMemberFromSession(session: TossLoginSession) {
  const sb = getSupabase();
  if (!sb) return null;

  const existing = await getMemberByTossUserKey(session.userKey);
  const now = new Date().toISOString();

  if (!existing) {
    const { data, error } = await sb
      .from("members")
      .insert({
        toss_user_key: session.userKey,
        name: session.name ?? null,
        email: session.email ?? null,
        last_login_at: now,
      })
      .select(MEMBER_COLS)
      .single();

    if (error || !data) {
      console.warn("[Round] member insert failed:", error?.message);
      return null;
    }

    return mapMember(data as MemberRow);
  }

  const patch: Record<string, string | null> = {
    last_login_at: now,
    updated_at: now,
  };

  if (session.name && existing.name !== session.name) {
    patch.name = session.name;
  }
  if (session.email && existing.email !== session.email) {
    patch.email = session.email;
  }

  const { data, error } = await sb
    .from("members")
    .update(patch)
    .eq("toss_user_key", session.userKey)
    .select(MEMBER_COLS)
    .single();

  if (error || !data) {
    console.warn("[Round] member update failed:", error?.message);
    return existing;
  }

  return mapMember(data as MemberRow);
}

export async function updateMemberNickname(userKey: number, nickname: string) {
  const sb = getSupabase();
  if (!sb) return { member: null, message: "회원 정보를 저장할 수 없어요." };

  const valid = validateNickname(nickname);
  if (!valid.ok) return { member: null, message: valid.message };

  const now = new Date().toISOString();

  const { data, error } = await sb
    .from("members")
    .update({
      nickname: valid.nickname,
      updated_at: now,
    })
    .eq("toss_user_key", userKey)
    .select(MEMBER_COLS)
    .single();

  if (error || !data) {
    return { member: null, message: error?.message || "닉네임 저장에 실패했어요." };
  }

  return { member: mapMember(data as MemberRow), message: null };
}

export async function anonymizeMemberByTossUserKey(userKey: number) {
  const sb = getSupabase();
  if (!sb) return { ok: false, message: "회원 정보를 찾을 수 없어요." };

  const now = new Date().toISOString();

  const { error } = await sb
    .from("members")
    .update({
      name: null,
      email: null,
      nickname: null,
      updated_at: now,
    })
    .eq("toss_user_key", userKey);

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, message: null };
}

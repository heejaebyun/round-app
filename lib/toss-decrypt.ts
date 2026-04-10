import crypto from "crypto";

/**
 * 토스 로그인 응답의 암호화된 프로필 값을 복호화한다.
 * 토스는 AES-256-CBC로 암호화한 base64 문자열을 내려줄 수 있다.
 *
 * - 평문이면 그대로 반환
 * - 암호화 형식이면 복호화 시도
 * - 실패하면 원문 반환 (로그인 흐름 안 깨뜨림)
 */
export function decryptTossValue(input: string | null | undefined): string | null {
  if (!input) return null;

  const key = process.env.TOSS_LOGIN_DECRYPTION_KEY;
  if (!key) {
    // 키 없으면 평문으로 간주
    return input;
  }

  // 평문 판별: base64 디코딩했을 때 읽을 수 있는 UTF-8이면 암호화된 것일 가능성
  // 토스 암호화 형식: base64(iv + encrypted)
  try {
    const buf = Buffer.from(input, "base64");

    // base64 디코딩 결과가 원본과 같으면 → base64가 아님 → 평문
    if (buf.toString("base64") !== input) {
      return input;
    }

    // IV(16bytes) + ciphertext 구조
    if (buf.length <= 16) {
      // 너무 짧으면 평문으로 간주
      return input;
    }

    const iv = buf.subarray(0, 16);
    const encrypted = buf.subarray(16);
    const keyBuf = Buffer.from(key, "base64");

    const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuf, iv);
    let decrypted = decipher.update(encrypted, undefined, "utf8");
    decrypted += decipher.final("utf8");

    return decrypted || null;
  } catch {
    // 복호화 실패 → 평문이었을 가능성, 원문 반환
    console.warn("[Round] toss profile decryption failed, using raw value");
    return input;
  }
}

/**
 * 토스 로그인 응답의 name/email을 복호화하여 반환한다.
 */
export function decryptTossProfile(raw: { name?: string | null; email?: string | null }) {
  const name = decryptTossValue(raw.name);
  const email = decryptTossValue(raw.email);

  if (process.env.NODE_ENV === "development") {
    console.log("[Round] toss profile decrypt:", {
      hasName: !!name,
      hasEmail: !!email,
      nameWasEncrypted: name !== raw.name,
      emailWasEncrypted: email !== raw.email,
    });
  }

  return { name, email };
}

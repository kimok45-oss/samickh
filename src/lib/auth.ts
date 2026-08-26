// lib/auth.ts — 관리자 인증 코어(순수 node:crypto — next/headers 미사용).
//
// proxy.ts(미들웨어)가 이 모듈을 import하므로 next/headers 등 요청 컨텍스트 의존을 두지 않는다.
// (cookies()를 쓰는 requireAdmin/guardAdminPage는 lib/auth-server.ts에 있다.)
//
// 규약(BUILD-CONTRACT §보안):
//  - ADMIN_PASSWORD_HASH: scrypt 해시, hex 포맷 `salt.hash` — `$` 문자 금지(.env 절단 함정 방지)
//  - 세션: HMAC-SHA256 서명 토큰(`ADMIN_SESSION_SECRET`), 만료 12h, timingSafeEqual
//  - fail-closed: env 미설정이면 로그인/검증 모두 항상 실패(|| "기본값" 폴백 절대 금지)

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/** 관리자 세션 쿠키 이름 */
export const ADMIN_COOKIE = "samickh_admin";

/** 세션 만료: 12시간 */
export const SESSION_MAX_AGE_SEC = 12 * 60 * 60;

const TOKEN_PREFIX = "samickh-admin";

function secret(): string | null {
  const s = process.env.ADMIN_SESSION_SECRET;
  return s && s.length >= 16 ? s : null; // 너무 짧은 시크릿도 미설정 취급(fail-closed)
}

/* ── 비밀번호(scrypt) ──────────────────────────────────────────────────── */

/** scrypt 해시 생성 — `saltHex.hashHex` (스크립트 scripts/admin-hash.mjs 와 동일 포맷) */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}.${hash}`;
}

/** 비밀번호 검증 — env `ADMIN_PASSWORD_HASH`(salt.hash) 대조. env 미설정/포맷 불량이면 항상 false. */
export function verifyPassword(password: string): boolean {
  const stored = process.env.ADMIN_PASSWORD_HASH;
  if (!stored || !password) return false;
  const [salt, hash] = stored.split(".");
  if (!salt || !hash || !/^[0-9a-f]+$/i.test(salt) || !/^[0-9a-f]+$/i.test(hash)) return false;
  try {
    const expected = Buffer.from(hash, "hex");
    const actual = scryptSync(password, salt, expected.length);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

/* ── 세션 토큰(HMAC 서명) ─────────────────────────────────────────────── */

function sign(expMs: number, sec: string): string {
  return createHmac("sha256", sec).update(`${TOKEN_PREFIX}.${expMs}`).digest("hex");
}

/** 로그인 성공 시 발급하는 서명 토큰 `<만료epochMs>.<hmacHex>`. 시크릿 미설정이면 null(fail-closed). */
export function createSessionToken(): string | null {
  const sec = secret();
  if (!sec) return null;
  const expMs = Date.now() + SESSION_MAX_AGE_SEC * 1000;
  return `${expMs}.${sign(expMs, sec)}`;
}

/** 세션 토큰 검증 — 서명 일치(timingSafeEqual) + 미만료. 시크릿 미설정이면 항상 false. */
export function verifySessionToken(token: string | null | undefined): boolean {
  const sec = secret();
  if (!sec || !token) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const expMs = Number(token.slice(0, dot));
  const sig = token.slice(dot + 1);
  if (!Number.isFinite(expMs) || expMs < Date.now()) return false;
  if (!/^[0-9a-f]{64}$/i.test(sig)) return false;
  try {
    const expected = Buffer.from(sign(expMs, sec), "hex");
    const actual = Buffer.from(sig, "hex");
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

/* ── 인메모리 rate-limit (로그인·문의 공용) ───────────────────────────── */

const buckets = new Map<string, number[]>();

/** `key`(예: "login:1.2.3.4")가 windowMs 안에 max회를 초과하면 true. */
export function rateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  buckets.set(key, recent);
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.every((t) => now - t >= windowMs)) buckets.delete(k);
  }
  return recent.length > max;
}

/** 성공 처리 후 카운터 리셋(예: 로그인 성공 — 몇 번 틀린 본인이 정답을 넣고도 계속 잠기는 것 방지).
 *  ⚠ rateLimited() 에 넘긴 키와 **문자열이 완전히 같아야** 지워진다. */
export function rateLimitReset(key: string): void {
  buckets.delete(key);
}

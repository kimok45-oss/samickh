"use server";

// 관리자 로그인/로그아웃 — requireAdmin 미적용 대상(계약 명시 예외).
// rate-limit 5회/10분(IP) + scrypt 해시 검증 + HMAC 서명 세션 발급. fail-closed(env 미설정 시 불가).

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  SESSION_MAX_AGE_SEC,
  createSessionToken,
  rateLimited,
  verifyPassword,
} from "@/lib/auth";
import { ipFrom } from "@/lib/analytics";
import { logAudit } from "@/lib/audit";

export type LoginState = { error: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const ip = ipFrom(await headers());
  if (rateLimited(`login:${ip}`, 5, 10 * 60 * 1000)) {
    return { error: "로그인 시도가 너무 많습니다. 10분 후 다시 시도해 주세요." };
  }

  // fail-closed: env 미설정이면 로그인 자체 불가
  if (!process.env.ADMIN_PASSWORD_HASH || !process.env.ADMIN_SESSION_SECRET) {
    return {
      error:
        "관리자 환경변수(ADMIN_PASSWORD_HASH·ADMIN_SESSION_SECRET)가 설정되지 않아 로그인할 수 없습니다.",
    };
  }

  const password = String(formData.get("password") ?? "");
  if (!verifyPassword(password)) {
    await logAudit("login-fail", "Admin", null, "비밀번호 불일치");
    return { error: "비밀번호가 일치하지 않습니다." };
  }

  const token = createSessionToken();
  if (!token) {
    return { error: "세션 생성에 실패했습니다(ADMIN_SESSION_SECRET 확인)." };
  }

  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  });
  await logAudit("login", "Admin");
  redirect("/admin");
}

export async function logout(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
  await logAudit("logout", "Admin");
  redirect("/admin/login");
}

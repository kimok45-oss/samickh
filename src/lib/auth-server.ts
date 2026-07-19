// lib/auth-server.ts — 서버액션/서버함수/조회페이지 인증 가드 (server-only)
//
// 왜 별도 파일인가: proxy.ts(미들웨어)가 lib/auth.ts의 순수 함수(상수·토큰 검증)를 import한다.
// 이 파일은 next/headers의 cookies()를 쓰므로 proxy.ts는 절대 이 파일을 import하지 않는다.
//
// 왜 필요한가: App Router 서버액션은 전역 액션 ID로 디스패치되는 POST다. proxy/middleware의
// matcher(/admin*)와 layout redirect는 "페이지 GET"만 가드하고, 액션 POST는 공개 라우트로
// 보내면 우회된다. 따라서 변형 액션은 자기 자신을 가드해야 한다. (Next 공식 권고)
//
// 사용 규약(BUILD-CONTRACT §보안):
//  - 모든 변형 서버 액션 첫 줄: await requireAdmin();   (login/logout·공개 문의 제출 제외)
//  - 모든 /admin 조회 페이지 첫 줄: await guardAdminPage();  (RSC 직렬화 유출 방지)
//  - 관리자 API 라우트: try { await requireAdmin(); } catch { return 401 }

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/auth";

/** 현재 요청이 유효한 관리자 세션(HMAC 서명 토큰)인지. fail-closed(시크릿 미설정=false). */
export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return verifySessionToken(jar.get(ADMIN_COOKIE)?.value);
}

/**
 * 변형 서버 액션/관리자 API용 — 비로그인/서명 불일치/만료 시 throw. fail-closed.
 * try/catch 폼 액션에서는 반드시 try '위'에 둘 것(throw가 catch에 흡수되지 않게).
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    throw new Error("UNAUTHORIZED");
  }
}

/**
 * /admin 조회 페이지(RSC) 첫 줄 가드 — 미인증이면 /admin/login으로 redirect.
 * 레이아웃/proxy 가드만으로는 미인증 GET에 어드민 데이터가 RSC 직렬화될 수 있어
 * 페이지 자신이 반드시 호출한다. (admin-read-page-rsc-leak 교훈)
 */
export async function guardAdminPage(): Promise<void> {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }
}

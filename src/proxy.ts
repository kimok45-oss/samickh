// src/proxy.ts — Next 16 미들웨어(구 middleware).
//
// 역할 2가지:
//  1) /admin/* 페이지 GET 가드 — 유효한 서명 세션 쿠키가 없으면 /admin/login redirect.
//     (서버액션 POST 우회는 각 액션의 requireAdmin이 담당 — 이건 UX/RSC 노출 1차 방어선)
//  2) lang 쿠키 자동감지 — 쿠키가 없으면 Accept-Language를 q값 순위로 파싱해 ko/en 결정.
//     ⚠ includes(",en") 부분매칭 금지 — 한국 크롬 기본값 "ko-KR,ko;q=0.9,en-US;q=0.8"에서
//       en이 오출력되는 버그(accept-language-includes-bug). 반드시 q 내림차순 첫 매치로.
//
// 이 파일은 lib/auth.ts(순수 crypto)만 import한다 — lib/auth-server.ts(next/headers) 금지.

import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/auth";

/** Accept-Language 헤더를 q값 내림차순으로 파싱해 ko/en 결정(기본 ko). */
function detectLang(header: string | null): "ko" | "en" {
  if (!header) return "ko";
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      let q = 1;
      for (const p of params) {
        const m = /^\s*q=([0-9.]+)\s*$/.exec(p);
        if (m) q = Number(m[1]);
      }
      return { tag: tag.trim().toLowerCase(), q: Number.isFinite(q) ? q : 0 };
    })
    .filter((x) => x.tag)
    .sort((a, b) => b.q - a.q);
  for (const { tag } of ranked) {
    if (tag === "ko" || tag.startsWith("ko-")) return "ko";
    if (tag === "en" || tag.startsWith("en-")) return "en";
  }
  return "ko";
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1) 관리자 페이지 GET 가드 (/admin/login 자신은 제외)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    if (!verifySessionToken(token)) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  // 2) 첫 방문 lang 쿠키 자동감지 (공개 페이지만 — /admin은 ko 고정 UI라 불필요)
  const res = NextResponse.next();
  if (!req.cookies.get("lang") && !pathname.startsWith("/admin")) {
    res.cookies.set("lang", detectLang(req.headers.get("accept-language")), {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
  return res;
}

export const config = {
  // 정적 자산·업로드 파일·API는 제외(페이지 요청에만 관여)
  matcher: ["/((?!_next/static|_next/image|api/|uploads/|fonts/|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2?)$).*)"],
};

// → src/app/lang-actions.ts
"use server";

import { cookies } from "next/headers";

// 언어 전환 — 쿠키 변경 시 Next가 현재 라우트를 자동 재렌더한다.
// (헤더 토글에서 본문 페이드아웃 후 호출 → fade-in)
export async function setLangAction(formData: FormData) {
  const lang = formData.get("lang") === "en" ? "en" : "ko";
  (await cookies()).set("lang", lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}

// → src/lib/lang.ts
import { cookies } from "next/headers";

export type Lang = "ko" | "en";

/** 현재 언어 — `lang` 쿠키 기반(기본 ko). 쿠키가 바뀌면 Next가 RSC를 재렌더한다.
 *  서버 컴포넌트/서버 액션에서만 호출 가능(클라이언트는 lang을 prop으로 받는다). */
export async function getLang(): Promise<Lang> {
  const v = (await cookies()).get("lang")?.value;
  return v === "en" ? "en" : "ko";
}

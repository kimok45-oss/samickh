// SiteContent(key-value CMS) 헬퍼 — 공개면은 반드시 이 모듈로 DB에서 읽는다.
// 폴백은 catch(조회 실패)에서만 — 정상 빈 값("")은 빈 값 그대로 노출(관리자 의도 존중).
import { prisma } from "@/lib/db";
import type { Lang } from "@/lib/lang";

export type ContentMap = Record<string, string>;

/** 여러 키를 한 번에 조회. lang=en이면 valueEn 우선(빈 문자열이면 ko 폴백). */
export async function getContents(keys: string[], lang: Lang = "ko"): Promise<ContentMap> {
  try {
    const rows = await prisma.siteContent.findMany({ where: { key: { in: keys } } });
    const map: ContentMap = {};
    for (const r of rows) {
      map[r.key] = lang === "en" && r.valueEn ? r.valueEn : r.value;
    }
    return map;
  } catch {
    return {};
  }
}

export async function getContent(key: string, lang: Lang = "ko"): Promise<string> {
  const m = await getContents([key], lang);
  return m[key] ?? "";
}

/** 그룹 전체 조회(관리자 화면·연락처 블록용) */
export async function getContentGroup(group: string, lang: Lang = "ko") {
  try {
    const rows = await prisma.siteContent.findMany({ where: { group }, orderBy: { sortOrder: "asc" } });
    return rows.map((r) => ({ ...r, display: lang === "en" && r.valueEn ? r.valueEn : r.value }));
  } catch {
    return [];
  }
}

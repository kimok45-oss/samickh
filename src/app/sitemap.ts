// sitemap.xml — 실존 라우트만(홈·company5·business11·products2·support/news 목록+상세).
// 정책 3종(privacy/terms/email-policy)·/admin·/api 는 제외(robots에서도 차단).
// FAQ는 공개 1건 이상일 때만 포함(계약 §콘텐츠 단일 소유권).
import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { SITE_URL } from "@/lib/seo/site.config";
import { BOARDS, type BoardKey } from "@/lib/board";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const url = (path: string) => `${SITE_URL}${path}`;

  const entries: MetadataRoute.Sitemap = [
    { url: url("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    // 회사소개 5
    ...["/company/greeting", "/company/history", "/company/clients", "/company/organization", "/company/location"].map(
      (p) => ({ url: url(p), lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 }),
    ),
    // 제품 2
    { url: url("/products"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: url("/products/order-guide"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    // 사업분야 목록
    { url: url("/business"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    // 지원/커뮤니티 목록 5 + 폼 2 + HTML 사이트맵
    ...(["tech", "cad", "pinfo", "notice", "news"] as BoardKey[]).map((b) => ({
      url: url(BOARDS[b].base),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    { url: url("/support/inquiry"), lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: url("/support/quote"), lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: url("/sitemap-page"), lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  try {
    // 사업분야 상세 10
    const series = await prisma.series.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
      orderBy: { sortOrder: "asc" },
    });
    for (const s of series) {
      entries.push({
        url: url(`/business/${s.slug}`),
        lastModified: s.updatedAt,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }

    // 게시글 상세(공개만) — 안정 키 slug
    const posts = await prisma.post.findMany({
      where: { published: true, board: { in: ["tech", "cad", "pinfo", "notice", "news"] } },
      select: { board: true, slug: true, origDate: true, updatedAt: true },
    });
    for (const p of posts) {
      const base = BOARDS[p.board as BoardKey]?.base;
      if (!base) continue;
      entries.push({
        url: url(`${base}/${p.slug}`),
        lastModified: p.updatedAt ?? p.origDate ?? now,
        changeFrequency: "yearly",
        priority: 0.4,
      });
    }

    // FAQ — 공개 1건 이상일 때만
    const faqCount = await prisma.faq.count({ where: { published: true } });
    if (faqCount > 0) {
      entries.push({
        url: url("/support/faq"),
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  } catch {
    // DB 조회 실패 시 정적 엔트리만 반환
  }

  return entries;
}

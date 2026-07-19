// lib/board.ts — 게시판 데이터 래퍼 (samickh 스키마 배선판)
//
// 스키마: Post { board, slug(안정키), title/titleEn, body/bodyEn, origNo, origDate, hits,
//               published, attachments: Attachment[] }
// 공개 라우트 매핑(BUILD-CONTRACT §콘텐츠 단일 소유권):
//   tech → /support/resources · cad → /support/cad · pinfo → /support/product-info
//   notice → /news/notice · news → /news/industry
//   free/qna: 공개 라우트 없음(원문 전건 외부업체 홍보+PII — 이식 안 함)
//
// ⚠ 조회수 증가는 여기서 하지 않는다 — RSC 렌더 중 cookies().set은 Next가 금지(삼진 함정).
//   상세 페이지의 HitBeacon(클라)이 /api/hit POST → 라우트 핸들러가 쿠키 디듀프 후 증가.

import { prisma } from "@/lib/db";

export type BoardKey = "notice" | "news" | "tech" | "cad" | "pinfo";

/** 게시판 → 공개 경로/라벨 매핑(원문 게시판명 그대로) */
export const BOARDS: Record<
  BoardKey,
  { base: string; ko: string; en: string; section: "support" | "news" }
> = {
  tech: { base: "/support/resources", ko: "유공압자료", en: "Hydraulic & Pneumatic Resources", section: "support" },
  cad: { base: "/support/cad", ko: "DWG/DWF DATA", en: "DWG/DWF DATA", section: "support" },
  pinfo: { base: "/support/product-info", ko: "PRODUCT INFORMATION", en: "PRODUCT INFORMATION", section: "support" },
  notice: { base: "/news/notice", ko: "공지사항", en: "Notice", section: "news" },
  news: { base: "/news/industry", ko: "업계관련뉴스", en: "Industry News", section: "news" },
};

export const BOARD_KEYS = Object.keys(BOARDS) as BoardKey[];

export function isBoardKey(v: string): v is BoardKey {
  return v in BOARDS;
}

/** 목록(서버 페이지네이션 10건) — 원문 조회수(hits)·원문 작성일(origDate) 기준 최신순. */
export async function getPostsPaged(opts: {
  board: BoardKey;
  page?: number;
  pageSize?: number;
  /** 공개 화면=true(기본), 어드민=false */
  publishedOnly?: boolean;
}) {
  const page = Math.max(1, Math.trunc(opts.page ?? 1) || 1);
  const pageSize = opts.pageSize ?? 10;
  const where = {
    board: opts.board,
    ...(opts.publishedOnly === false ? {} : { published: true }),
  };
  const [total, items] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      orderBy: [{ origDate: "desc" }, { id: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { attachments: { select: { id: true, missing: true } } },
    }),
  ]);
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** 상세 — slug 기준(안정 키). 공개 화면은 published=true만. 없으면 null(호출부 notFound()). */
export async function getPostBySlug(board: BoardKey, slug: string, publishedOnly = true) {
  if (!slug || slug.length > 100) return null;
  const post = await prisma.post.findUnique({
    where: { board_slug: { board, slug } },
    include: { attachments: { orderBy: { id: "asc" } } },
  });
  if (!post) return null;
  if (publishedOnly && !post.published) return null;
  return post;
}

/** 이전/다음 글 — 같은 게시판, origDate(동일 시 id) 기준. 목록이 최신순이므로 prev=더 과거. */
export async function getAdjacentPosts(board: BoardKey, origDate: Date | null, id: number) {
  const d = origDate ?? new Date(0);
  const [prev, next] = await Promise.all([
    prisma.post.findFirst({
      where: {
        board,
        published: true,
        OR: [{ origDate: { lt: d } }, { origDate: d, id: { lt: id } }],
      },
      orderBy: [{ origDate: "desc" }, { id: "desc" }],
      select: { slug: true, title: true, titleEn: true },
    }),
    prisma.post.findFirst({
      where: {
        board,
        published: true,
        OR: [{ origDate: { gt: d } }, { origDate: d, id: { gt: id } }],
      },
      orderBy: [{ origDate: "asc" }, { id: "asc" }],
      select: { slug: true, title: true, titleEn: true },
    }),
  ]);
  return { prev, next };
}

/** FAQ — 공개 화면용(published만, 정렬순). 0건이면 페이지에서 notFound() 처리. */
export function getPublishedFaqs() {
  return prisma.faq.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
}

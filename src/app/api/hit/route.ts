// POST /api/hit — 게시글 조회수 증가(쿠키 디듀프 1일).
// RSC 렌더 중 cookies().set은 Next가 금지(삼진 함정) → 상세 페이지의 HitBeacon(클라)이 호출한다.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isBoardKey } from "@/lib/board";
import { ipFrom, isBotUA } from "@/lib/analytics";
import { rateLimited } from "@/lib/auth";

const DEDUP_SEC = 24 * 60 * 60; // 1일

export async function POST(req: NextRequest) {
  const res = new NextResponse(null, { status: 204 });
  try {
    if (isBotUA(req.headers.get("user-agent") ?? "")) return res;

    // 무인증 쓰기 라우트 — IP당 1분 60건(쿠키 디듀프를 우회한 조회수 부풀리기 차단).
    if (rateLimited(`hit:${ipFrom(req.headers)}`, 60, 60 * 1000)) {
      return new NextResponse(null, { status: 429 });
    }

    const body = (await req.json().catch(() => null)) as
      | { board?: unknown; slug?: unknown }
      | null;
    const board = typeof body?.board === "string" ? body.board : "";
    const slug = typeof body?.slug === "string" ? body.slug.slice(0, 100) : "";
    if (!isBoardKey(board) || !/^[a-z0-9-]+$/i.test(slug)) return res;

    const cookieKey = `hv_${board}_${slug}`;
    if (req.cookies.get(cookieKey)) return res; // 1일 내 재조회 — 증가 안 함

    await prisma.post.update({
      where: { board_slug: { board, slug } },
      data: { hits: { increment: 1 } },
    });
    res.cookies.set(cookieKey, "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: DEDUP_SEC,
    });
  } catch {
    // 글 없음/기타 — 무시
  }
  return res;
}

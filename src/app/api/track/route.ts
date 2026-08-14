// POST /api/track — 방문 수집(PageViewTracker 비콘). PII-free:
//  raw IP·UA 미저장, visitorId=일별 솔티드 해시, referrer는 origin+path만, 봇 UA 제외.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { browserOf, cleanReferrer, dailyVisitorId, deviceOf, ipFrom, isBotUA, osOf } from "@/lib/analytics";
import { rateLimited } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const ua = req.headers.get("user-agent") ?? "";
    if (isBotUA(ua)) return new NextResponse(null, { status: 204 });

    // 무인증 쓰기 라우트 — IP당 1분 120건(정상 탐색보다 넉넉, 대량 삽입은 차단).
    if (rateLimited(`track:${ipFrom(req.headers)}`, 120, 60 * 1000)) {
      return new NextResponse(null, { status: 429 });
    }

    const body = (await req.json().catch(() => null)) as
      | { path?: unknown; referrer?: unknown; width?: unknown; kind?: unknown; eventName?: unknown }
      | null;
    const path = typeof body?.path === "string" ? body.path.slice(0, 300) : "";
    if (!path.startsWith("/") || path.startsWith("/admin") || path.startsWith("/api")) {
      return new NextResponse(null, { status: 204 });
    }

    const lang = req.cookies.get("lang")?.value === "en" ? "en" : "ko";
    const width = typeof body?.width === "number" ? body.width : undefined;

    // kind="event" + eventName 은 전환(문의 제출 등) 기록용. 기본은 페이지뷰.
    // 전환(event)은 서버액션에서만 기록 — 공개 라우트로는 위조가 가능하므로 거부(항상 view로 저장)
    const incomingKind = String(body?.kind ?? "").trim().toLowerCase();
    if (incomingKind === "event") return new NextResponse(null, { status: 204 });

    const kind = body?.kind === "event" ? "event" : "view";
    const eventName =
      kind === "event" && typeof body?.eventName === "string" && body.eventName.trim()
        ? body.eventName.trim().slice(0, 60)
        : null;

    await prisma.pageView.create({
      data: {
        path,
        referrer: cleanReferrer(typeof body?.referrer === "string" ? body.referrer : null),
        device: deviceOf(ua, width),
        browser: browserOf(ua),
        os: osOf(ua),
        lang,
        visitorId: dailyVisitorId(ipFrom(req.headers), ua),
        kind,
        eventName,
      },
    });
  } catch {
    // 수집 실패는 조용히 무시(사이트 동작에 영향 없음)
  }
  return new NextResponse(null, { status: 204 });
}

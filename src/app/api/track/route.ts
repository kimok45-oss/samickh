// POST /api/track — 방문 수집(PageViewTracker 비콘). PII-free:
//  raw IP·UA 미저장, visitorId=일별 솔티드 해시, referrer는 origin+path만, 봇 UA 제외.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cleanReferrer, dailyVisitorId, deviceOf, ipFrom, isBotUA } from "@/lib/analytics";

export async function POST(req: NextRequest) {
  try {
    const ua = req.headers.get("user-agent") ?? "";
    if (isBotUA(ua)) return new NextResponse(null, { status: 204 });

    const body = (await req.json().catch(() => null)) as
      | { path?: unknown; referrer?: unknown; width?: unknown }
      | null;
    const path = typeof body?.path === "string" ? body.path.slice(0, 300) : "";
    if (!path.startsWith("/") || path.startsWith("/admin") || path.startsWith("/api")) {
      return new NextResponse(null, { status: 204 });
    }

    const lang = req.cookies.get("lang")?.value === "en" ? "en" : "ko";
    const width = typeof body?.width === "number" ? body.width : undefined;

    await prisma.pageView.create({
      data: {
        path,
        referrer: cleanReferrer(typeof body?.referrer === "string" ? body.referrer : null),
        device: deviceOf(ua, width),
        lang,
        visitorId: dailyVisitorId(ipFrom(req.headers), ua),
      },
    });
  } catch {
    // 수집 실패는 조용히 무시(사이트 동작에 영향 없음)
  }
  return new NextResponse(null, { status: 204 });
}

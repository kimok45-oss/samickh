// lib/analytics.ts — 자체 방문 분석 (samickh 배선판, PII-free)
//
// 스키마(PageView): path · referrer · device(mobile|desktop|tablet) · lang · visitorId · createdAt
//
// PII 원칙(BUILD-CONTRACT §관리자 ⑪):
//  - raw IP·UA는 저장하지 않는다. visitorId = "일별 솔티드 해시"(sha256(salt+KST날짜+ip+ua) 앞 16자)
//    → 날이 바뀌면 같은 사람도 다른 id가 되므로 개인 추적 불가, 일 단위 순방문 집계만 가능.
//  - referrer는 수집 라우트에서 origin+path만 저장(쿼리스트링 식별자 차단).
//  - 봇/크롤러/헤드리스 UA는 수집 제외.

import { createHash } from "node:crypto";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";

/* ── UA 파싱/판별 ─────────────────────────────────────────────────────── */

export function deviceOf(ua: string, width?: number): string {
  const u = (ua ?? "").toLowerCase();
  if (/ipad|tablet|(android(?!.*mobile))/.test(u)) return "tablet";
  if (/mobi|iphone|ipod|windows phone|android.*mobile/.test(u)) return "mobile";
  if (typeof width === "number" && width > 0 && width < 768) return "mobile";
  return "desktop";
}

/** 명백한 봇/크롤러/헤드리스 UA — true면 수집 제외 */
export function isBotUA(ua: string): boolean {
  if (!ua) return true;
  return /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|headless|monitor|lighthouse|preview|scrape|curl|wget|python-requests/i.test(
    ua,
  );
}

/** 라우트 핸들러용 클라 IP 추출 — x-forwarded-for에서 TRUSTED_PROXY_HOPS(기본 1)만큼 뒤에서. */
export function ipFrom(h: Headers): string {
  const fwd = h.get("x-forwarded-for");
  if (fwd) {
    const list = fwd.split(",").map((s) => s.trim()).filter(Boolean);
    const hops = Math.max(1, Math.trunc(Number(process.env.TRUSTED_PROXY_HOPS ?? "1")) || 1);
    return list[Math.max(0, list.length - hops)] ?? list[0] ?? "unknown";
  }
  return h.get("x-real-ip")?.trim() || "unknown";
}

/* ── 일별 솔티드 visitorId ────────────────────────────────────────────── */

// 시크릿: ADMIN_SESSION_SECRET 재사용(있으면 재기동에도 안정) → 없으면 부팅 난수(분석 전용이라 무해)
const bootSalt = randomBytes(16).toString("hex");

const KST_MS = 9 * 3600 * 1000;
const DAY = 86400000;

/** UTC ms → KST 'YYYY-MM-DD' */
export function kstDate(ms: number): string {
  return new Date(ms + KST_MS).toISOString().slice(0, 10);
}

export function dailyVisitorId(ip: string, ua: string): string {
  const secret = process.env.ADMIN_SESSION_SECRET || bootSalt;
  return createHash("sha256")
    .update(`${secret}:${kstDate(Date.now())}:${ip}:${ua}`)
    .digest("hex")
    .slice(0, 16);
}

/** referrer 정리 — origin+path만(쿼리/해시 제거). 파싱 실패 시 null. */
export function cleanReferrer(ref: string | null | undefined): string | null {
  if (!ref) return null;
  try {
    const u = new URL(ref);
    return (u.origin + u.pathname).slice(0, 300);
  } catch {
    return null;
  }
}

/* ── 유입 채널 분류(한국 엔진 포함) ───────────────────────────────────── */

export type SourceKey = "direct" | "internal" | "search" | "social" | "referral";

export function classifySource(referrer: string | null, selfHost?: string | null): SourceKey {
  if (!referrer) return "direct";
  let host = "";
  try {
    host = new URL(referrer).host.toLowerCase();
  } catch {
    return "direct";
  }
  if (!host) return "direct";
  if (selfHost && host === selfHost.toLowerCase()) return "internal";
  if (/(^|\.)(google|bing|yahoo|naver|daum|duckduckgo|baidu|yandex|nate|zum)\./.test(host)) return "search";
  if (/(^|\.)(facebook|instagram|youtube|youtu\.be|twitter|t\.co|x\.com|linkedin|kakao|tiktok|threads|band\.us|line)/.test(host))
    return "social";
  return "referral";
}

/* ── 집계 ─────────────────────────────────────────────────────────────── */

export type Stat = { key: string; count: number; pct: number };

export type AnalyticsData = {
  range: number;
  totals: {
    visitors: number;
    pageviews: number;
    todayVisitors: number;
    avgPerVisitor: number;
    allTime: number;
  };
  daily: { date: string; label: string; visitors: number; views: number }[];
  sources: Stat[];
  devices: Stat[];
  pages: Stat[];
  recent: { path: string; source: string; device: string; time: string }[];
};

/** 방문 분석 집계 — days(1~90)일 KST 창. */
export async function getAnalytics(days: number): Promise<AnalyticsData> {
  const range = Math.min(Math.max(Math.trunc(days) || 7, 1), 90);
  const now = Date.now();
  const todayStr = kstDate(now);
  const startStr = kstDate(now - (range - 1) * DAY);
  const baseUTC = new Date(`${startStr}T00:00:00.000Z`).getTime() - KST_MS;

  let rows: {
    path: string;
    referrer: string | null;
    device: string | null;
    visitorId: string | null;
    createdAt: Date;
  }[] = [];
  let allTime = 0;
  try {
    [rows, allTime] = await Promise.all([
      prisma.pageView.findMany({
        where: { createdAt: { gte: new Date(baseUTC) } },
        orderBy: { id: "desc" },
        take: 50000,
        select: { path: true, referrer: true, device: true, visitorId: true, createdAt: true },
      }),
      prisma.pageView.count(),
    ]);
  } catch {
    // 조회 실패 시 빈 데이터 폴백
  }

  const vid = (r: { visitorId: string | null }) => r.visitorId ?? "";
  const pageviews = rows.length;
  // visitorId는 일별 솔트라 "일별 순방문 합"이 정확한 정의 — 날짜:id 조합으로 집계
  const visitors = new Set(
    rows.filter((r) => r.visitorId).map((r) => `${kstDate(r.createdAt.getTime())}:${r.visitorId}`),
  ).size;
  const todayVisitors = new Set(
    rows.filter((r) => kstDate(r.createdAt.getTime()) === todayStr && r.visitorId).map(vid),
  ).size;

  // 일별 버킷(KST, 빈 날 0)
  const dayViews = new Map<string, number>();
  const daySets = new Map<string, Set<string>>();
  const daily: AnalyticsData["daily"] = [];
  for (let i = 0; i < range; i++) {
    const key = kstDate(baseUTC + i * DAY);
    dayViews.set(key, 0);
    daySets.set(key, new Set());
    const d = new Date(baseUTC + i * DAY + KST_MS);
    daily.push({ date: key, label: `${d.getUTCMonth() + 1}/${d.getUTCDate()}`, views: 0, visitors: 0 });
  }
  for (const r of rows) {
    const key = kstDate(r.createdAt.getTime());
    if (dayViews.has(key)) {
      dayViews.set(key, (dayViews.get(key) ?? 0) + 1);
      if (r.visitorId) daySets.get(key)!.add(r.visitorId);
    }
  }
  for (const d of daily) {
    d.views = dayViews.get(d.date) ?? 0;
    d.visitors = daySets.get(d.date)?.size ?? 0;
  }

  const rank = (m: Map<string, number>, base: number): Stat[] =>
    [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => ({ key, count, pct: base ? Math.round((count / base) * 100) : 0 }));
  const group = (arr: string[]) => {
    const m = new Map<string, number>();
    for (const k of arr) m.set(k, (m.get(k) ?? 0) + 1);
    return m;
  };

  const sourceKeys = rows.map((r) => classifySource(r.referrer)).filter((s) => s !== "internal");
  const sources = rank(group(sourceKeys), sourceKeys.length);

  const devKeys = rows.map((r) => r.device || "desktop");
  const devices = rank(group(devKeys), devKeys.length);

  const pages = rank(group(rows.map((r) => r.path)), pageviews).slice(0, 8);

  const recent = rows.slice(0, 8).map((r) => ({
    path: r.path,
    source: classifySource(r.referrer),
    device: r.device || "desktop",
    time: r.createdAt.toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

  return {
    range,
    totals: {
      visitors,
      pageviews,
      todayVisitors,
      avgPerVisitor: visitors ? Math.round((pageviews / visitors) * 10) / 10 : 0,
      allTime,
    },
    daily,
    sources,
    devices,
    pages,
    recent,
  };
}

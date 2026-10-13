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
import { SITE_URL } from "@/lib/seo/site.config";

/* ── UA 파싱/판별 ─────────────────────────────────────────────────────── */

export function deviceOf(ua: string, width?: number): string {
  const u = (ua ?? "").toLowerCase();
  if (/ipad|tablet|(android(?!.*mobile))/.test(u)) return "tablet";
  if (/mobi|iphone|ipod|windows phone|android.*mobile/.test(u)) return "mobile";
  if (typeof width === "number" && width > 0 && width < 768) return "mobile";
  return "desktop";
}

/* UA → 브라우저·OS 라벨. UA 원문은 저장하지 않고 이 라벨만 남긴다(준식별자 방지).
 * ⚠ 판별 순서가 정확도다 — 크로뮴 계열은 UA에 "Chrome"·"Safari"를 함께 달고 있어
 *   Edge·삼성·오페라·웨일을 Chrome보다 먼저 걸러야 하고, OS는 Android를 Linux보다 먼저 본다. */
const UA_MAX = 32;

export function browserOf(ua: string | null | undefined): string | null {
  const u = ua ?? "";
  let b: string | null = null;
  if (/Edg[ea]?\//i.test(u)) b = "Edge";
  else if (/SamsungBrowser/i.test(u)) b = "Samsung Internet";
  else if (/OPR\/|Opera/i.test(u)) b = "Opera";
  else if (/Whale/i.test(u)) b = "Whale";
  else if (/Firefox|FxiOS/i.test(u)) b = "Firefox";
  else if (/Chrome|CriOS|Chromium/i.test(u)) b = "Chrome";
  else if (/Safari/i.test(u)) b = "Safari";
  return b ? b.slice(0, UA_MAX) : null;
}

export function osOf(ua: string | null | undefined): string | null {
  const u = ua ?? "";
  let o: string | null = null;
  if (/Windows/i.test(u)) o = "Windows";
  else if (/Android/i.test(u)) o = "Android";
  else if (/iPhone|iPad|iPod|iOS/i.test(u)) o = "iOS";
  else if (/Mac OS X|Macintosh/i.test(u)) o = "macOS";
  else if (/Linux|X11/i.test(u)) o = "Linux";
  return o ? o.slice(0, UA_MAX) : null;
}

/** 명백한 봇/크롤러/헤드리스 UA — true면 수집 제외 */
export function isBotUA(ua: string): boolean {
  if (!ua) return true;
  return /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|headless|monitor|lighthouse|preview|scrape|curl|wget|python-requests/i.test(
    ua,
  );
}

/** 라우트 핸들러용 클라 IP 추출 — 구현은 lib/request.ts(clientIpFrom) 한 곳.
 *  2026-10-11 오너 '1번부터'(전체점검 공통 고장 A): 기본 홉 1·맨 왼쪽 폴백·홉 무관 x-real-ip 채택 변형을
 *  걷어내고 정본으로 통일. 호출부(로그인·hit·track·quote)는 이름 그대로 쓴다. */
export { clientIpFrom as ipFrom } from "@/lib/request";

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

/** 루프백/개발 호스트(localhost·*.localhost·127.x·::1·0.0.0.0) — 포트가 붙어 있어도 된다. */
export function isLocalHost(host: string | null | undefined): boolean {
  const h = siteHostKey(host);
  if (!h) return false;
  return (
    h === "localhost" ||
    h.endsWith(".localhost") ||
    h === "[::1]" ||
    h === "::1" ||
    h === "0.0.0.0" ||
    /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(h)
  );
}

/**
 * 호스트 비교용 키 — 소문자 · 포트 제거 · 끝 점 제거 · 앞 "www." 제거.
 * 2026-10-12 오너 '함께 발견한 거 고쳐 줘'(ITEM 1): www.samickh.co.kr 와 samickh.co.kr 는 같은 사이트로 본다.
 */
export function siteHostKey(host: string | null | undefined): string {
  if (!host) return "";
  let h = host.trim().toLowerCase();
  // 포트만 뗀다(IPv6 대괄호 표기 `[::1]:5700` 은 괄호 유지)
  const m = h.match(/^(\[[^\]]*\]|[^:]*)(?::\d+)?$/);
  if (m) h = m[1];
  h = h.replace(/\.$/, "");
  return h.startsWith("www.") ? h.slice(4) : h;
}

/**
 * 대시보드(읽기 시점) 집계의 "우리 사이트" 호스트 — NEXT_PUBLIC_SITE_URL(site.config SITE_URL)의 호스트.
 * 2026-10-12 오너 '함께 발견한 거 고쳐 줘'(ITEM 1): 집계가 classifySource(referrer) 를 selfHost 없이 불러
 *   자기 사이트 안에서 페이지를 옮겨 다닌 방문이 '외부 링크(referral)' 로 잡혔다.
 * ⚠ localhost 류는 운영의 자기 호스트로 보지 않는다(null) — env 미설정 폴백(localhost:5700)이 집계 기준이 되지 않게.
 *   (PageView 엔 source 컬럼이 없어 유입 분류는 읽기 시점에만 한다 — 기록 시점 요청 호스트는 쓸 자리가 없다.)
 */
export function siteSelfHost(siteUrl: string = SITE_URL): string | null {
  let host = "";
  try {
    host = new URL(siteUrl).host;
  } catch {
    return null;
  }
  const key = siteHostKey(host);
  if (!key || isLocalHost(key)) return null;
  return host.toLowerCase();
}

export function classifySource(referrer: string | null, selfHost?: string | null): SourceKey {
  if (!referrer) return "direct";
  let host = "";
  try {
    host = new URL(referrer).host.toLowerCase();
  } catch {
    return "direct";
  }
  if (!host) return "direct";
  // 2026-10-12 오너 '함께 발견한 거 고쳐 줘'(ITEM 1): www/맨 도메인·포트 차이는 같은 사이트로 비교
  if (selfHost && siteHostKey(selfHost) && siteHostKey(host) === siteHostKey(selfHost)) return "internal";
  if (/(^|\.)(google|bing|yahoo|naver|daum|duckduckgo|baidu|yandex|nate|zum)\./.test(host)) return "search";
  if (/(^|\.)(facebook|instagram|youtube|youtu\.be|twitter|t\.co|x\.com|linkedin|kakao|tiktok|threads|band\.us|line)/.test(host))
    return "social";
  return "referral";
}

/* ── 집계 ─────────────────────────────────────────────────────────────── */

export type Stat = { key: string; count: number; pct: number };

function rankStats(m: Map<string, number>, base: number): Stat[] {
  return [...m.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => ({ key, count, pct: base ? Math.round((count / base) * 100) : 0 }));
}

function countBy(arr: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const k of arr) m.set(k, (m.get(k) ?? 0) + 1);
  return m;
}

/**
 * 진입 채널 분포 — '내부 이동(internal)' 은 진입 채널이 아니므로 뺀 뒤 비율을 낸다.
 * 2026-10-12 오너 '함께 발견한 거 고쳐 줘'(ITEM 1): getAnalytics 에서 떼어 내 selfHost 를 받게 함(표본 행으로 검증 가능).
 */
export function sourceStats(rows: { referrer: string | null }[], selfHost: string | null): Stat[] {
  const keys = rows.map((r) => classifySource(r.referrer, selfHost)).filter((s) => s !== "internal");
  return rankStats(countBy(keys), keys.length);
}

export type AnalyticsData = {
  range: number;
  totals: {
    visitors: number;
    pageviews: number;
    todayVisitors: number;
    avgPerVisitor: number;
    allTime: number;
    /** kind="event" / eventName="inquiry" — 기간 내 문의 제출 건수 */
    conversions: number;
  };
  daily: { date: string; label: string; visitors: number; views: number }[];
  sources: Stat[];
  devices: Stat[];
  browsers: Stat[];
  oses: Stat[];
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
    browser: string | null;
    os: string | null;
    visitorId: string | null;
    createdAt: Date;
  }[] = [];
  let allTime = 0;
  let conversions = 0;
  try {
    // kind:"view" — 전환 이벤트(kind:"event")가 방문 집계에 섞이면 방문 수가 부풀려진다.
    [rows, allTime, conversions] = await Promise.all([
      prisma.pageView.findMany({
        where: { kind: "view", createdAt: { gte: new Date(baseUTC) } },
        orderBy: { id: "desc" },
        take: 50000,
        select: { path: true, referrer: true, device: true, browser: true, os: true, visitorId: true, createdAt: true },
      }),
      prisma.pageView.count({ where: { kind: "view" } }),
      prisma.pageView.count({
        where: { kind: "event", eventName: "inquiry", createdAt: { gte: new Date(baseUTC) } },
      }),
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

  const rank = rankStats;
  const group = countBy;

  // 2026-10-12 오너 '함께 발견한 거 고쳐 줘'(ITEM 1): 자기 사이트 호스트(SITE_URL)를 넘겨 내부 이동을 알아보게 함
  const selfHost = siteSelfHost();
  const sources = sourceStats(rows, selfHost);

  const devKeys = rows.map((r) => r.device || "desktop");
  const devices = rank(group(devKeys), devKeys.length);

  const browserKeys = rows.map((r) => r.browser).filter((v): v is string => Boolean(v));
  const browsers = rank(group(browserKeys), browserKeys.length).slice(0, 5);

  const osKeys = rows.map((r) => r.os).filter((v): v is string => Boolean(v));
  const oses = rank(group(osKeys), osKeys.length).slice(0, 5);

  const pages = rank(group(rows.map((r) => r.path)), pageviews).slice(0, 8);

  const recent = rows.slice(0, 8).map((r) => ({
    path: r.path,
    source: classifySource(r.referrer, selfHost),
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
      conversions,
    },
    daily,
    sources,
    devices,
    browsers,
    oses,
    pages,
    recent,
  };
}

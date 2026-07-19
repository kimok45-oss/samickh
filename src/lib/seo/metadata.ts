// src/lib/seo/metadata.ts — Next.js 16 Metadata API 헬퍼 (samickh 배선판)
//
//  - rootMetadata() : 루트 layout.tsx 의 `export const metadata = rootMetadata()` 로 사용.
//  - pageMetadata({...}) : 각 페이지에서 호출해 제목/설명/OG/canonical(self) 생성.
//
// i18n 주의(쿠키형): 한 URL이 양 언어를 서빙 → 언어별 URL이 없다.
//   언어별 canonical/hreflang을 두지 않고 단일 canonical + og:locale(+alternate)만 선언한다.
import type { Metadata } from "next";
import { SITE, SITE_URL, VERIFICATION } from "./site.config";

/** 상대경로를 배포 도메인 기준 절대 URL로. */
function abs(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return SITE_URL + (path.startsWith("/") ? path : "/" + path);
}

/** 루트 layout 용 기본 메타데이터(모든 페이지가 상속). canonical은 페이지별 self가 정본. */
export function rootMetadata(): Metadata {
  const other: Record<string, string> = {};
  if (VERIFICATION.naver) other["naver-site-verification"] = VERIFICATION.naver;
  if (VERIFICATION.bing) other["msvalidate.01"] = VERIFICATION.bing;
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: SITE.titleDefault,
      template: SITE.titleTemplate,
    },
    description: SITE.description,
    keywords: [...SITE.keywords],
    applicationName: SITE.name,
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: SITE.locale,
      alternateLocale: [...SITE.altLocales],
      title: SITE.titleDefault,
      description: SITE.description,
      url: SITE_URL,
      images: [{ url: abs(SITE.ogImage), width: 1200, height: 630, alt: SITE.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE.titleDefault,
      description: SITE.description,
      images: [abs(SITE.ogImage)],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: { icon: "/icon.png", apple: "/apple-touch-icon.png" }, // scripts/gen-og.mjs 생성(원본 CI 심볼)
    verification: {
      ...(VERIFICATION.google ? { google: VERIFICATION.google } : {}),
      ...(Object.keys(other).length ? { other } : {}),
    },
  };
}

export interface PageMetaInput {
  /** "%s" 템플릿에 들어갈 페이지명(예: "공지사항") */
  title: string;
  /** 없으면 SITE.description */
  description?: string;
  /** canonical 경로(예: "/news/notice") — 절대 URL 자동 변환, 페이지별 self */
  path: string;
  /** 페이지 전용 OG 이미지(없으면 기본) */
  image?: string;
  /** 검색 제외(정책·임시 페이지) */
  noIndex?: boolean;
  type?: "website" | "article";
  /** article 일 때 ISO 날짜 */
  publishedTime?: string;
}

/** 개별 페이지 메타데이터.
 *  정적: `export const metadata = pageMetadata({...})`
 *  동적: `export async function generateMetadata(){ return pageMetadata({...}) }` */
export function pageMetadata(input: PageMetaInput): Metadata {
  const desc = input.description ?? SITE.description;
  const img = abs(input.image ?? SITE.ogImage);
  const url = abs(input.path);
  return {
    title: input.title,
    description: desc,
    alternates: { canonical: input.path },
    robots: input.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: input.type ?? "website",
      title: input.title,
      description: desc,
      url,
      images: [{ url: img, width: 1200, height: 630, alt: input.title }],
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: desc,
      images: [img],
    },
  };
}

/* ── 언어 인식 메타데이터(쿠키 i18n) — EN 페이지에 한국어 title/desc가 남지 않게 ──
   정적 페이지: export const generateMetadata = () => pageMetadataI18n({...})
   동적 페이지: generateMetadata 안에서 호출(titleKo/titleEn에 DB *En 값 전달) */
import { getLang } from "@/lib/lang";

const SITE_DESC_EN =
  "SAMICK H&P — hydraulic & pneumatic cylinder manufacturer since 1987 (spun off 1998). Bore Ø40–Ø800, stroke up to 2,000 mm, from standard to steel-mill and vehicle cylinders.";
const SUFFIX = { ko: "삼익유공압주식회사", en: "SAMICK H&P" } as const;

export async function pageMetadataI18n(input: {
  titleKo: string;
  titleEn: string;
  descKo?: string;
  descEn?: string;
  path: string;
  image?: string;
  noIndex?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
}): Promise<Metadata> {
  const lang = await getLang();
  const title = lang === "en" ? input.titleEn : input.titleKo;
  const desc = lang === "en" ? (input.descEn ?? SITE_DESC_EN) : (input.descKo ?? SITE.description);
  const md = pageMetadata({
    title,
    description: desc,
    path: input.path,
    image: input.image,
    noIndex: input.noIndex,
    type: input.type,
    publishedTime: input.publishedTime,
  });
  // titleTemplate(한국어 접미)을 우회 — 언어별 절대 타이틀
  md.title = { absolute: `${title} | ${SUFFIX[lang]}` };
  return md;
}

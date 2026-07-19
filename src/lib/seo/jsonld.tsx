// src/lib/seo/jsonld.tsx — 구조화 데이터(JSON-LD) 빌더 + <JsonLd> 출력 컴포넌트 (samickh 배선판)
//
// 원문 사실만 직렬화한다: 주소·전화·팩스(사실대장 §1). 이메일은 원문 부재 → 넣지 않는다.
// 서버 컴포넌트에서 직접 렌더하면 된다(클라 JS 불필요).
import { SITE, SITE_URL, ORG } from "./site.config";

function abs(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return SITE_URL + (path.startsWith("/") ? path : "/" + path);
}

/** JSON-LD를 안전하게 출력 — '<' 이스케이프로 스크립트 조기종료/XSS 차단. */
export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

/** 회사(비상장 → Organization) — 루트 layout 또는 홈에 1회. */
export function organizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": ORG.type,
    name: SITE.name,
    legalName: ORG.legalName,
    alternateName: "SAMICK H&P",
    url: SITE_URL,
    logo: abs(ORG.logo),
    ...(ORG.foundingDate ? { foundingDate: ORG.foundingDate } : {}),
    ...(ORG.telephone ? { telephone: ORG.telephone } : {}),
    ...(ORG.faxNumber ? { faxNumber: ORG.faxNumber } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: ORG.address.streetAddress,
      addressLocality: ORG.address.addressLocality,
      ...(ORG.address.addressRegion ? { addressRegion: ORG.address.addressRegion } : {}),
      ...(ORG.address.postalCode ? { postalCode: ORG.address.postalCode } : {}),
      addressCountry: ORG.address.addressCountry,
    },
    ...(ORG.sameAs.length ? { sameAs: [...ORG.sameAs] } : {}),
  };
}

/** 사이트 — 홈에 1회(사이트 내 검색 없음 → SearchAction 미선언). */
export function websiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE_URL,
    inLanguage: "ko-KR",
  };
}

/** 빵부스러기 — 서브 페이지에 현재 경로 계층을 선언. */
export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}

/** 게시글 상세(공지/업계뉴스) — 원문 게시물의 사실만. */
export function articleJsonLd(a: {
  title: string;
  description?: string;
  path: string;
  image?: string;
  datePublished: string; // ISO
  dateModified?: string; // ISO
  isNews?: boolean;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": a.isNews ? "NewsArticle" : "Article",
    headline: a.title,
    ...(a.description ? { description: a.description } : {}),
    image: [abs(a.image ?? SITE.ogImage)],
    datePublished: a.datePublished,
    dateModified: a.dateModified ?? a.datePublished,
    mainEntityOfPage: { "@type": "WebPage", "@id": abs(a.path) },
    author: { "@type": "Organization", name: SITE.name },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: { "@type": "ImageObject", url: abs(ORG.logo) },
    },
  };
}

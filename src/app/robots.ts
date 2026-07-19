// robots.txt — 관리자/API/정책 페이지 크롤 차단(계약 §SEO: 정책 3종 noindex+robots 제외).
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site.config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/privacy", "/terms", "/email-policy"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

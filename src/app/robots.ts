// robots.txt — 관리자/API만 크롤 차단.
// 정책 3종(privacy/terms/email-policy)은 각 페이지가 meta noindex를 출력하므로
// robots에서 막지 않는다 — 막으면 크롤러가 페이지를 못 읽어 noindex가 무력화된다(Google 문서).
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site.config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

// /llms.txt — AI 검색 대응(GEO): AI 어시스턴트에게 사이트 개요·주요 페이지를 안내.
// seo-kit 표준 자산 이식(llmstxt.org). 값은 site.config 단일 원천, 경로는 실재 확인분만.
import { SITE, SITE_URL } from "@/lib/seo/site.config";

export const dynamic = "force-static";

const PAGES: [string, string][] = [
  ["/company", "회사소개"],
  ["/products", "제품소개"],
  ["/business", "사업소개"],
];

const text = (v: unknown): string =>
  typeof v === "string" ? v : ((v as { ko?: string })?.ko ?? "");

export function GET() {
  const name = text((SITE as { name: unknown }).name);
  const desc = text((SITE as { description: unknown }).description);
  const body = [
    `# ${name}`,
    "",
    `> ${desc}`,
    "",
    "## 주요 페이지",
    ...PAGES.map(([path, label]) => `- [${label}](${SITE_URL}${path})`),
    "",
    "## 참고",
    `- 사이트맵: ${SITE_URL}/sitemap.xml`,
    "- 본 문서는 AI 어시스턴트가 회사를 정확히 안내하도록 제공됩니다.",
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

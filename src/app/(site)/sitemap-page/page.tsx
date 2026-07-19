// /sitemap-page — HTML 사이트맵(원본 유틸 sitemap.php 대응). FAQ는 공개 1건 이상일 때만 노출.
import Link from "next/link";
import { pageMetadata } from "@/lib/seo/metadata";
import { getLang } from "@/lib/lang";
import { prisma } from "@/lib/db";

export const metadata = pageMetadata({
  title: "사이트맵",
  description: "삼익유공압주식회사 홈페이지 전체 메뉴.",
  path: "/sitemap-page",
});

export default async function SitemapPage() {
  const lang = await getLang();
  const [series, faqCount] = await Promise.all([
    prisma.series.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true, nameEn: true },
    }),
    prisma.faq.count({ where: { published: true } }).catch(() => 0),
  ]);

  const t = (ko: string, en: string) => (lang === "ko" ? ko : en);

  const sections: { title: string; links: { href: string; label: string }[] }[] = [
    {
      title: t("회사소개", "Company"),
      links: [
        { href: "/company/greeting", label: t("인사말", "Greeting") },
        { href: "/company/history", label: t("회사연혁", "History") },
        { href: "/company/clients", label: t("주요거래업체", "Clients") },
        { href: "/company/organization", label: t("조직현황", "Organization") },
        { href: "/company/location", label: t("찾아오시는길", "Location") },
      ],
    },
    {
      title: t("사업분야", "Business"),
      links: [
        { href: "/business", label: t("사업분야 전체", "Overview") },
        ...series.map((s) => ({
          href: `/business/${s.slug}`,
          label: lang === "en" && s.nameEn ? s.nameEn : s.name,
        })),
      ],
    },
    {
      title: t("제품소개", "Products"),
      links: [
        { href: "/products", label: t("제품소개", "Products") },
        { href: "/products/order-guide", label: t("주문방법", "Order Guide") },
      ],
    },
    {
      title: t("고객지원", "Support"),
      links: [
        { href: "/support/resources", label: t("유공압자료", "Resources") },
        { href: "/support/cad", label: "DWG/DWF DATA" },
        { href: "/support/product-info", label: "PRODUCT INFORMATION" },
        { href: "/support/inquiry", label: t("온라인문의", "Inquiry") },
        { href: "/support/quote", label: t("견적요청", "Quote") },
        ...(faqCount > 0 ? [{ href: "/support/faq", label: t("자주 묻는 질문", "FAQ") }] : []),
      ],
    },
    {
      title: t("커뮤니티", "Community"),
      links: [
        { href: "/news/notice", label: t("공지사항", "Notice") },
        { href: "/news/industry", label: t("업계관련뉴스", "Industry News") },
      ],
    },
    {
      title: t("정책", "Policies"),
      links: [
        { href: "/privacy", label: t("개인정보처리방침", "Privacy Policy") },
        { href: "/terms", label: t("이용약관", "Terms of Use") },
        { href: "/email-policy", label: t("이메일무단수집거부", "No Email Collection") },
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-24 pt-12 md:px-8">
      <h1 className="font-mono text-[clamp(1.7rem,3.4vw,2.4rem)] font-semibold tracking-tight text-ink">
        {t("사이트맵", "Sitemap")}
      </h1>
      <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((sec) => (
          <section key={sec.title}>
            <h2 className="border-b border-line pb-2 font-mono text-[13px] font-bold uppercase tracking-[0.14em] text-ink">
              {sec.title}
            </h2>
            <ul className="mt-3 space-y-1.5">
              {sec.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[14px] text-ink-dim underline-offset-4 transition-colors hover:text-ink hover:underline"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

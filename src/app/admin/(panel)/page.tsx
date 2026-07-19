// /admin — 관리자 대시보드 ⑪: 콘텐츠 현황 + 방문분석 패널.
import Link from "next/link";
import { guardAdminPage } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { getAnalytics } from "@/lib/analytics";
import { fmtDateTime } from "@/lib/date";
import AnalyticsPanel from "@/components/AnalyticsPanel";
import { ui } from "../ui";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  await guardAdminPage();

  const sp = await searchParams;
  const range = Number(sp.range) || 7;

  const [postCount, productCount, seriesCount, inquiryCount, faqCount, recentInquiries, analytics] =
    await Promise.all([
      prisma.post.count(),
      prisma.product.count(),
      prisma.series.count(),
      prisma.inquiry.count(),
      prisma.faq.count(),
      prisma.inquiry.findMany({ orderBy: { id: "desc" }, take: 5 }),
      getAnalytics(range),
    ]);

  const cards = [
    { href: "/admin/posts", label: "게시글", value: postCount },
    { href: "/admin/products", label: "제품", value: productCount },
    { href: "/admin/series", label: "사업분야 계열", value: seriesCount },
    { href: "/admin/inquiries", label: "문의/견적", value: inquiryCount },
    { href: "/admin/faqs", label: "FAQ", value: faqCount },
  ];

  return (
    <main className={ui.page}>
      <h1 className={ui.h1}>대시보드</h1>

      <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="rounded-lg border border-line bg-bg-raised p-4 transition-colors hover:border-ink-faint">
            <p className="text-[12px] font-bold text-ink-faint">{c.label}</p>
            <p className="mt-1 font-mono text-2xl font-bold tabular-nums">{c.value.toLocaleString("ko-KR")}</p>
          </Link>
        ))}
      </div>

      <section className="mt-8">
        <div className="flex items-center gap-3">
          <h2 className={ui.h2}>최근 문의/견적</h2>
          <Link href="/admin/inquiries" className="text-[12.5px] font-semibold text-ink-faint hover:text-ink">
            전체보기 →
          </Link>
        </div>
        {recentInquiries.length === 0 ? (
          <p className="mt-3 rounded-lg border border-line bg-bg-raised px-4 py-6 text-center text-[13px] text-ink-faint">
            접수된 문의가 없습니다.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-line rounded-lg border border-line bg-bg-raised">
            {recentInquiries.map((q) => (
              <li key={q.id}>
                <Link href={`/admin/inquiries/${q.id}`} className="flex items-center gap-3 px-4 py-3 text-[13.5px] hover:bg-bg-panel">
                  <span className={ui.chip}>{q.kind === "quote" ? "견적" : "문의"}</span>
                  <span className="font-semibold">{q.name}</span>
                  {q.company && <span className="text-ink-faint">{q.company}</span>}
                  <time className="ml-auto font-mono text-[11.5px] tabular-nums text-ink-faint">
                    {fmtDateTime(q.createdAt)}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <AnalyticsPanel data={analytics} range={analytics.range} basePath="/admin" />
    </main>
  );
}

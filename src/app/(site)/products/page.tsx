// 제품소개 — DB Product 13건. 카테고리 필터(0건 카테고리는 숨김 — 공압 등) +
// 행 확장(details 아코디언)으로 치수표 HTML(라이트 플레이트) 렌더. 형번 스트립 헤드.
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getLang } from "@/lib/lang";
import { pageMetadataI18n } from "@/lib/seo/metadata";
import { LegacyPlate } from "@/components/LegacyHtml";

export const generateMetadata = () =>
  pageMetadataI18n({ titleKo: "제품소개", titleEn: "Products", descKo: "삼익유공압 제품소개 — SS70H/SS140H 사양과 장착형식별 외형치수표, 제철용 강력 실린더.", descEn: "Dimension tables and specifications - SS70H/SS140H series and steel-mill cylinders.", path: "/products" });

// 원문 카테고리 명칭
const CATS: { id: number; ko: string; en: string }[] = [
  { id: 1, ko: "표준 유압실린더", en: "Standard Hydraulic" },
  { id: 2, ko: "제철용 강력 실린더", en: "Heavy-Duty for Steel Mills" },
  { id: 3, ko: "공압 실린더", en: "Pneumatic" },
];

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const sp = await searchParams;
  const lang = await getLang();

  const all = await prisma.product.findMany({
    where: { published: true },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    select: { slug: true, category: true, title: true, titleEn: true, body: true, bodyEn: true },
  });

  // 0건 카테고리는 필터에서 숨김(원문: 공압 0건)
  const cats = CATS.map((c) => ({ ...c, count: all.filter((p) => p.category === c.id).length })).filter(
    (c) => c.count > 0,
  );
  // 기본 = 전체(원문 db=product 기본 목록이 전 13건 표시)
  const requested = Number(sp.cat);
  const activeCat = cats.some((c) => c.id === requested) ? requested : 0;
  const items = activeCat === 0 ? all : all.filter((p) => p.category === activeCat);

  return (
    <div>
      <h1 className="font-mono text-[clamp(1.7rem,3.4vw,2.4rem)] font-semibold tracking-tight text-ink">
        {lang === "ko" ? "제품소개" : "Products"}
      </h1>
      {/* 형번 스트립 헤드 — 대표 시리즈·치수표 구성(원문 총계) */}
      <p className="tnum mt-3 font-mono text-[12.5px] text-ink-faint">
        SS 70H / SS 140H — {lang === "ko" ? `사양 1건 · 외형치수표 11종 · 제철용 1건` : `1 spec · 11 dimension tables · 1 steel-mill unit`}
      </p>

      {/* 카테고리 필터 */}
      <div className="mt-8 flex flex-wrap gap-1.5" role="group" aria-label={lang === "ko" ? "카테고리" : "Category"}>
        <Link
          href="/products"
          aria-current={activeCat === 0 ? "true" : undefined}
          className={`border px-3.5 py-2 text-[13px] transition-colors ${
            activeCat === 0 ? "border-ink bg-ink text-bg" : "border-line text-ink-dim hover:border-ink-faint hover:text-ink"
          }`}
        >
          {lang === "en" ? "All" : "전체"} <span className="tnum font-mono text-[11px] opacity-70">{all.length}</span>
        </Link>
        {cats.map((c) => (
          <Link
            key={c.id}
            href={`/products?cat=${c.id}`}
            aria-current={activeCat === c.id ? "true" : undefined}
            className={`border px-3.5 py-2 text-[13px] transition-colors ${
              activeCat === c.id
                ? "border-ink bg-ink text-bg"
                : "border-line text-ink-dim hover:border-ink-faint hover:text-ink"
            }`}
          >
            {lang === "en" ? c.en : c.ko} <span className="tnum font-mono text-[11px] opacity-70">{c.count}</span>
          </Link>
        ))}
      </div>

      {/* 행 확장 아코디언 */}
      <ul className="mt-8 border-t border-line">
        {items.map((p) => {
          const title = lang === "en" && p.titleEn ? p.titleEn : p.title;
          const body = lang === "en" && p.bodyEn ? p.bodyEn : p.body;
          return (
            <li key={p.slug} className="border-b border-line">
              <details className="acc prod-acc group">
                <summary className="flex cursor-pointer items-center justify-between gap-4 py-4 transition-colors hover:bg-bg-raised sm:py-5">
                  <span className="flex min-w-0 items-baseline gap-4">
                    <span className="tnum shrink-0 font-mono text-[12px] uppercase tracking-[0.06em] text-ink-faint">
                      {p.slug}
                    </span>
                    <span className="truncate text-[15px] text-ink sm:text-[16px]">{title}</span>
                  </span>
                  <span aria-hidden className="acc-plus shrink-0 font-mono text-[18px] leading-none text-ink-faint transition-transform">
                    +
                  </span>
                </summary>
                <div className="pb-6 pt-1">
                  <LegacyPlate html={body} />
                </div>
              </details>
            </li>
          );
        })}
      </ul>

      {/* 주문방법 연결 */}
      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/products/order-guide"
          className="inline-flex h-11 items-center border border-line px-5 text-[14px] font-medium text-ink-dim transition-colors hover:border-ink-faint hover:text-ink"
        >
          {lang === "ko" ? "실린더 주문방법" : "How to Order"}
        </Link>
        <Link
          href="/support/quote"
          className="inline-flex h-11 items-center bg-red px-5 text-[14px] font-semibold text-white transition-colors hover:bg-red-live"
        >
          {lang === "ko" ? "견적요청" : "Request a Quote"}
        </Link>
      </div>
    </div>
  );
}

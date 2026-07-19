// 홈(/) — 직관형 악보(오너 피드백 2026-07-19 반영: 조작 패널은 /products/order-guide로 이동):
// S1 히어로(회사가 뭘 하는지 3초) → S2 계열 10 → S3 주문방법 안내 → S4 납품 기록 → S5 자료실 → S6 견적·공지
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getLang } from "@/lib/lang";
import { getContents } from "@/lib/content";
import { fmtDate } from "@/lib/date";
import { Reveal } from "@/components/motion/motion-primitives";
import SeriesLedger from "@/components/home/SeriesLedger";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "유압·공압 실린더 제조",
  description: "유압·공압 실린더 전문 제조 — 보어 Ø40~Ø800, 행정 2,000mm. 표준부터 제철용·차량용까지 10계열.",
  path: "/",
});

const T = {
  ko: {
    heroHead1: "유압·공압 실린더",
    heroHead2: "전문 제조",
    heroSub: "초소형에서 초대형에 이르기까지, 고객이 원하는 용도대로 개발·제작합니다.",
    heroFact: "보어 Ø40 – Ø800 · 행정 2,000mm · 1987년부터",
    heroCaption: "유압·공압 실린더 — 삼익유공압",
    ctaProducts: "제품 보기",
    ctaQuote: "견적요청",
    s2Head: "실린더 10계열",
    s2Link: "사업분야 전체",
    s3Head: "형번으로 주문합니다",
    s3Desc: "삼익 실린더는 카탈로그의 주문방법에 따라 형번 한 줄로 주문됩니다. 보어·행정·장착형식을 고르면 형번과 이론 출력을 바로 확인할 수 있습니다.",
    s3Cta: "주문방법 · 형번 조합기",
    s4Head: "1987년부터의 기록",
    s4Meta: "제작·개발·등록 실적 — 회사연혁에서",
    s4Link: "연혁 전체",
    s5Head: "도면과 카탈로그",
    s5TechTitle: "유공압자료",
    s5TechDesc: "표준유압·공압·MILL TYPE 카탈로그 PDF",
    s5CadTitle: "DWG/DWF DATA",
    s5CadDesc: "실린더 도면 데이터 자료실",
    s5Count: (n: number) => `${n}건`,
    s6Head: "견적·문의",
    s6Desc: "제작 문의와 견적요청에 영업일 기준 빠르게 회신드립니다.",
    s6Quote: "견적요청",
    s6Inquiry: "온라인문의",
    s6Location: "오시는길",
    s6Notice: "공지사항",
  },
  en: {
    heroHead1: "Hydraulic & Pneumatic",
    heroHead2: "Cylinder Manufacturer",
    heroSub: "From the smallest to the largest — developed and built to the customer's exact use.",
    heroFact: "Bore Ø40 – Ø800 · Stroke 2,000mm · Since 1987",
    heroCaption: "Hydraulic & pneumatic cylinders — SAMICK H&P",
    ctaProducts: "View Products",
    ctaQuote: "Request a Quote",
    s2Head: "10 Cylinder Series",
    s2Link: "All business fields",
    s3Head: "Ordered by Model Code",
    s3Desc: "SAMICK cylinders are ordered with a single model code, following the catalog's ordering method. Pick bore, stroke and mounting to see the code and theoretical output instantly.",
    s3Cta: "Ordering Guide · Code Builder",
    s4Head: "On Record Since 1987",
    s4Meta: "Production, development and registration — from company history",
    s4Link: "Full history",
    s5Head: "Drawings & Catalogs",
    s5TechTitle: "Technical Data",
    s5TechDesc: "Hydraulic, pneumatic and MILL TYPE catalogs (PDF)",
    s5CadTitle: "DWG/DWF DATA",
    s5CadDesc: "Cylinder drawing data library",
    s5Count: (n: number) => `${n} files`,
    s6Head: "Quote & Inquiry",
    s6Desc: "We respond promptly to manufacturing inquiries and quote requests.",
    s6Quote: "Request a Quote",
    s6Inquiry: "Inquiry",
    s6Location: "Location",
    s6Notice: "Notice",
  },
};

// S4: 연혁 14건 중 제작/개발/등록(공급) 실적만 — 원문 문구 기준 키워드
const RECORD_RE = /제작|개발|등록|공급/;

/** 히어로 비주얼 — 실린더 실물 사진.
 *  HERO_IMG 경로의 사진을 프레임 플레이트로 렌더한다(광택 CG 대신 실물 — "유치함" 제거).
 *  ⚠ 교체법: Envato 등에서 받은 유압실린더 사진을 public/uploads/hero/cylinder.jpg 로 저장하면
 *     아래 HERO_IMG 를 그 경로로 바꾸기만 하면 된다(현재는 회수한 실물 제품 사진 임시 사용). */
const HERO_IMG = "/uploads/hero/cylinder-interim.jpg"; // TODO: Envato 유압실린더 사진 받으면 이 경로만 교체
function HeroVisual({ src, caption }: { src: string; caption: string }) {
  return (
    <figure className="relative">
      {/* 도면지 톤 프레임 플레이트 */}
      <div className="overflow-hidden border border-line bg-bg-raised shadow-[0_20px_50px_-24px_rgba(20,22,25,0.35)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="삼익유공압 유압·공압 실린더"
          width={1148}
          height={460}
          className="aspect-[5/2] w-full object-cover"
        />
      </div>
      {/* 코너 크롭 마크(엔지니어링 도판 느낌 — 레드 그래픽 전용) */}
      <span aria-hidden className="absolute -left-1.5 -top-1.5 h-4 w-4 border-l-2 border-t-2 border-red-live" />
      <span aria-hidden className="absolute -bottom-1.5 -right-1.5 h-4 w-4 border-b-2 border-r-2 border-red-live" />
      <figcaption className="mt-2 font-mono text-[10.5px] tracking-[0.08em] text-ink-faint">{caption}</figcaption>
    </figure>
  );
}

export default async function HomePage() {
  const lang = await getLang();
  const t = T[lang];

  const [series, history, notices, techCount, cadCount, contents] = await Promise.all([
    prisma.series.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    }),
    prisma.history.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.post.findMany({
      where: { board: "notice", published: true },
      orderBy: [{ origDate: "desc" }, { id: "desc" }],
      take: 3,
      select: { slug: true, title: true, titleEn: true, origDate: true },
    }),
    prisma.post.count({ where: { board: "tech", published: true } }),
    prisma.post.count({ where: { board: "cad", published: true } }),
    getContents(["slogan_en"], lang),
  ]);

  const records = history.filter((h) => RECORD_RE.test(h.text));

  return (
    <div className="mx-auto max-w-[1280px] px-5 md:px-8">
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />

      {/* ── S1 히어로 — 무엇을 하는 회사인지 + 어디로 갈지 ── */}
      <section className="grid items-center gap-10 pb-16 pt-12 md:grid-cols-[1fr_minmax(380px,640px)] md:pb-24 md:pt-20">
        <div>
          <h1 className="text-[clamp(2rem,5vw,3.4rem)] font-bold leading-[1.16] tracking-tight text-ink">
            {t.heroHead1}
            <br />
            {t.heroHead2}
          </h1>
          <p className="mt-5 max-w-[46ch] text-[15.5px] leading-relaxed text-ink-dim">{t.heroSub}</p>
          {contents.slogan_en && (
            <p className="mt-2 max-w-[52ch] font-mono text-[12.5px] leading-relaxed text-ink-faint">{contents.slogan_en}</p>
          )}
          <p className="tnum mt-6 font-mono text-[13px] text-ink-dim">{t.heroFact}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="inline-flex h-12 items-center bg-red px-6 text-[15px] font-semibold text-white transition-colors hover:bg-red-live"
            >
              {t.ctaProducts}
            </Link>
            <Link
              href="/support/quote"
              className="inline-flex h-12 items-center border border-line px-6 text-[15px] font-medium text-ink-dim transition-colors hover:border-ink-faint hover:text-ink"
            >
              {t.ctaQuote}
            </Link>
          </div>
        </div>
        <Reveal className="hidden md:block">
          <HeroVisual src={HERO_IMG} caption={t.heroCaption} />
        </Reveal>
      </section>

      {/* ── S2 계열 10 ── */}
      <Reveal as="section" className="border-t border-line pt-14 md:pt-20">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-[clamp(1.4rem,2.8vw,2rem)] font-semibold tracking-tight text-ink">{t.s2Head}</h2>
          <Link href="/business" className="text-[13.5px] text-ink-dim underline underline-offset-4 hover:text-ink">
            {t.s2Link}
          </Link>
        </div>
        <div className="mt-6">
          <SeriesLedger
            lang={lang}
            items={series.map((s) => ({
              slug: s.slug,
              name: lang === "en" && s.nameEn ? s.nameEn : s.name,
              nameEn: s.nameEn,
              seriesCode: s.seriesCode,
              kind: s.kind,
              thumb: s.images[0]?.path ?? null,
            }))}
          />
        </div>
      </Reveal>

      {/* ── S3 주문방법 안내(조합기는 전용 페이지에) ── */}
      <Reveal as="section" className="mt-16 md:mt-24">
        <div className="grid gap-6 border border-line bg-bg-raised/40 p-6 sm:p-10 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="text-[clamp(1.3rem,2.6vw,1.8rem)] font-semibold tracking-tight text-ink">{t.s3Head}</h2>
            <p className="mt-3 max-w-[64ch] text-[14.5px] leading-relaxed text-ink-dim">{t.s3Desc}</p>
          </div>
          <Link
            href="/products/order-guide"
            className="inline-flex h-12 items-center justify-center border border-ink-faint px-6 text-[14.5px] font-medium text-ink transition-colors hover:bg-bg-panel"
          >
            {t.s3Cta} →
          </Link>
        </div>
      </Reveal>

      {/* ── S4 납품 기록(연혁 중 제작·개발·등록) ── */}
      <Reveal as="section" className="mt-16 md:mt-24">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-[clamp(1.4rem,2.8vw,2rem)] font-semibold tracking-tight text-ink">{t.s4Head}</h2>
          <div className="flex items-baseline gap-5">
            <span className="hidden text-[12px] text-ink-faint sm:inline">{t.s4Meta}</span>
            <Link href="/company/history" className="text-[13.5px] text-ink-dim underline underline-offset-4 hover:text-ink">
              {t.s4Link}
            </Link>
          </div>
        </div>
        <ul className="mt-6 border-t border-line">
          {records.map((h) => (
            <li key={h.id} className="grid grid-cols-[76px_1fr] items-baseline gap-4 border-b border-line py-3.5 sm:grid-cols-[110px_1fr] sm:gap-6">
              <span className="tnum font-mono text-[15px] font-semibold text-ink sm:text-[17px]">{h.year}</span>
              <span className="text-[14px] leading-relaxed text-ink-dim sm:text-[14.5px]">
                {lang === "en" && h.textEn ? h.textEn : h.text}
              </span>
            </li>
          ))}
        </ul>
      </Reveal>

      {/* ── S5 자료실 밴드 ── */}
      <Reveal as="section" className="mt-16 md:mt-24">
        <h2 className="text-[clamp(1.4rem,2.8vw,2rem)] font-semibold tracking-tight text-ink">{t.s5Head}</h2>
        <div className="mt-6 grid gap-px border border-line bg-line sm:grid-cols-2">
          <Link href="/support/resources" className="group bg-bg p-6 transition-colors hover:bg-bg-raised sm:p-8">
            <span className="font-mono text-[clamp(1.4rem,2.6vw,1.9rem)] font-bold leading-none text-ink-faint transition-colors group-hover:text-ink-dim">
              PDF
            </span>
            <span className="mt-4 block text-[16px] font-semibold text-ink">{t.s5TechTitle}</span>
            <span className="mt-1 block text-[13px] text-ink-dim">{t.s5TechDesc}</span>
            <span className="tnum mt-4 inline-block border border-line px-2 py-0.5 font-mono text-[11.5px] text-ink-faint">
              {t.s5Count(techCount)}
            </span>
          </Link>
          <Link href="/support/cad" className="group bg-bg p-6 transition-colors hover:bg-bg-raised sm:p-8">
            <span className="font-mono text-[clamp(1.4rem,2.6vw,1.9rem)] font-bold leading-none text-ink-faint transition-colors group-hover:text-ink-dim">
              DWG · DWF
            </span>
            <span className="mt-4 block text-[16px] font-semibold text-ink">{t.s5CadTitle}</span>
            <span className="mt-1 block text-[13px] text-ink-dim">{t.s5CadDesc}</span>
            <span className="tnum mt-4 inline-block border border-line px-2 py-0.5 font-mono text-[11.5px] text-ink-faint">
              {t.s5Count(cadCount)}
            </span>
          </Link>
        </div>
      </Reveal>

      {/* ── S6 견적 CTA + 공지 ── */}
      <Reveal as="section" className="my-16 md:my-24">
        <div className="border border-line bg-bg-raised/40 p-6 sm:p-10">
          <h2 className="text-[clamp(1.4rem,2.8vw,2rem)] font-semibold tracking-tight text-ink">{t.s6Head}</h2>
          <p className="mt-3 text-[14.5px] text-ink-dim">{t.s6Desc}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/support/quote"
              className="inline-flex h-11 items-center bg-red px-5 text-[14px] font-semibold text-white transition-colors hover:bg-red-live"
            >
              {t.s6Quote}
            </Link>
            <Link
              href="/support/inquiry"
              className="inline-flex h-11 items-center border border-line px-5 text-[14px] font-medium text-ink-dim transition-colors hover:border-ink-faint hover:text-ink"
            >
              {t.s6Inquiry}
            </Link>
            <Link
              href="/company/location"
              className="inline-flex h-11 items-center border border-line px-5 text-[14px] font-medium text-ink-dim transition-colors hover:border-ink-faint hover:text-ink"
            >
              {t.s6Location}
            </Link>
          </div>

          {notices.length > 0 && (
            <div className="mt-10 border-t border-line pt-5">
              <div className="font-mono text-[11px] tracking-[0.14em] text-ink-faint">{t.s6Notice}</div>
              <ul className="mt-2">
                {notices.map((n) => (
                  <li key={n.slug} className="border-b border-line-soft last:border-b-0">
                    <Link href={`/news/notice/${n.slug}`} className="flex items-baseline justify-between gap-4 py-2.5 hover:text-ink">
                      <span className="truncate text-[13.5px] text-ink-dim">{lang === "en" && n.titleEn ? n.titleEn : n.title}</span>
                      <span className="tnum shrink-0 font-mono text-[11.5px] text-ink-faint">{fmtDate(n.origDate, lang)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Reveal>
    </div>
  );
}

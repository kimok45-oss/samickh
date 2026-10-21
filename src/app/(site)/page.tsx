// 홈(/) — 직관형 악보(오너 피드백 2026-07-19 반영: 조작 패널은 /products/order-guide로 이동):
// S1 히어로(회사가 뭘 하는지 3초) → S2 계열 10 → S3 형번 주문 → S4 제작 범위 → S5 실린더가 들어간 곳
// → S6 도면과 카탈로그 → S7 견적·공지
// 섹션 개선 적용(오너 채택 2026-08-30): S4 신설(RangeBand) · 구 S4 납품 기록 → RecordBand(잉크 밴드)
// · 구 S5 자료실 텍스트 상자 2개 → DrawingSheet(도면 시트). 잘된 섹션(계열 원장·형번 스테이션·견적 밴드)은 그대로.
//
// 레이아웃 계약: RangeBand·RecordBand 는 풀블리드(배경 전환)이고 DrawingSheet 는 제 컨테이너를 갖는다.
// 따라서 세 섹션은 홈의 max-w 컨테이너 **바깥**(최상위)에 놓는다 — 안에 넣으면 배경이 1280px에 갇히고 좌우 패딩이 겹친다.
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getLang } from "@/lib/lang";
import { getContents } from "@/lib/content";
import { fmtDate } from "@/lib/date";
import { Reveal } from "@/components/motion/motion-primitives";
import SeriesLedger from "@/components/home/SeriesLedger";
import RangeBand from "@/components/home/RangeBand";
import RecordBand, { type RecordRow } from "@/components/home/RecordBand";
import DrawingSheet from "@/components/home/DrawingSheet";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo/jsonld";
import { pageMetadataI18n } from "@/lib/seo/metadata";

export const generateMetadata = () =>
  pageMetadataI18n({ titleKo: "유압·공압 실린더 제조", titleEn: "Hydraulic & Pneumatic Cylinder Manufacturer", descKo: "유압·공압 실린더 전문 제조 — 보어 Ø40~Ø800, 행정 2,000mm. 표준부터 제철용·차량용까지 10계열.", descEn: "Hydraulic and pneumatic cylinders - bore O40-O800, stroke up to 2,000 mm. Ten series from standard to steel-mill and vehicle types.", path: "/" });

const T = {
  ko: {
    heroHead1: "유압·공압 실린더",
    heroHead2: "전문 제조",
    heroSub: "초소형에서 초대형에 이르기까지, 고객이 원하는 용도대로 개발·제작합니다.",
    heroFact: "보어 Ø40 – Ø800 · 행정 2,000mm · 1987년부터",
    heroCaption: "실린더 내경 13단 Ø40–Ø250 · 특주 Ø800 — 카탈로그 실측", 
    ctaProducts: "제품 보기",
    ctaQuote: "견적요청",
    s2Head: "실린더 10계열",
    s2Link: "사업분야 전체",
    s3Head: "형번으로 주문합니다",
    s3Desc: "삼익 실린더는 카탈로그의 주문방법에 따라 형번 한 줄로 주문됩니다. 보어·행정·장착형식을 고르면 형번과 이론 출력을 바로 확인할 수 있습니다.",
    s3Cta: "주문방법 · 형번 조합기",
    // S4 제작 범위 · S5 실린더가 들어간 곳 · S6 도면과 카탈로그 문구는 각 컴포넌트가 소유한다(단일 소유권).
    ctaHead: "견적·문의",
    ctaDesc: "제작 문의와 견적요청에 영업일 기준 빠르게 회신드립니다.",
    ctaQuoteBtn: "견적요청",
    ctaInquiry: "온라인문의",
    ctaLocation: "오시는길",
    ctaNotice: "공지사항",
  },
  en: {
    heroHead1: "Hydraulic & Pneumatic",
    heroHead2: "Cylinder Manufacturer",
    heroSub: "From the smallest to the largest — developed and built to the customer's exact use.",
    heroFact: "Bore Ø40 – Ø800 · Stroke 2,000mm · Since 1987",
    heroCaption: "13 bore sizes Ø40–Ø250 · custom to Ø800 — from the catalog",
    ctaProducts: "View Products",
    ctaQuote: "Request a Quote",
    s2Head: "10 Cylinder Series",
    s2Link: "All business fields",
    s3Head: "Ordered by Model Code",
    s3Desc: "SAMICK cylinders are ordered with a single model code, following the catalog's ordering method. Pick bore, stroke and mounting to see the code and theoretical output instantly.",
    s3Cta: "Ordering Guide · Code Builder",
    // Copy for S4 / S5 / S6 lives in RangeBand · RecordBand · DrawingSheet (single ownership).
    ctaHead: "Quote & Inquiry",
    ctaDesc: "We respond promptly to manufacturing inquiries and quote requests.",
    ctaQuoteBtn: "Request a Quote",
    ctaInquiry: "Inquiry",
    ctaLocation: "Location",
    ctaNotice: "Notice",
  },
};

// S5: 연혁 14건 중 제작/개발/등록(공급) 실적만 — 원문 문구 기준 키워드(기준 불변)
const RECORD_RE = /제작|개발|등록|공급/;

/** 히어로 비주얼 — 보어 스펙트럼(추상, 데이터 실측).
 *  실린더 내경 13단(Ø40~Ø250 — 카탈로그 p.11 원문)을 실제 지름 비율의 원으로 그리고,
 *  특주 대구경(램형 Ø800)은 화면을 넘는 점선 호로 암시 — 원본 슬로건
 *  "orders from small items to large ones"의 시각화. 장식 아닌 실측 도해. */
const BORES = [40, 50, 63, 80, 100, 125, 140, 150, 160, 180, 200, 224, 250];
function BoreSpectrum() {
  const SC = 0.66; // mm → px
  const F = 0.58; // 인접 원 중심 간격 계수(겹침 리듬)
  const BASE = 272; // 기준선 y(원들이 바닥에 접함 — 보어 게이지)
  let x = 28 + (BORES[0] * SC) / 2;
  const circles = BORES.map((d, i) => {
    const r = (d * SC) / 2;
    if (i > 0) x += F * ((BORES[i - 1] * SC) / 2 + r);
    return { d, r, cx: x, cy: BASE - r };
  });
  const R800 = (800 * SC) / 2;
  return (
    <svg viewBox="0 0 780 320" fill="none" aria-hidden className="h-auto w-full">
      {/* 기준선 */}
      <line x1="16" y1={BASE} x2="764" y2={BASE} stroke="#c6cbc9" strokeWidth="1" />
      {/* 보어 13단 — 실제 지름 비율 */}
      {circles.map((c, i) => (
        <circle
          key={c.d}
          cx={c.cx}
          cy={c.cy}
          r={c.r}
          stroke="#565d64"
          strokeOpacity={0.35 + 0.55 * (i / (circles.length - 1))}
          strokeWidth={1.4}
          pathLength={100}
          className="bore-draw"
          style={{ animationDelay: `${0.15 + i * 0.07}s` }}
        />
      ))}
      {/* 특주 Ø800 — 화면을 넘는 점선 호(레드 그래픽 전용) */}
      <circle
        cx={828}
        cy={BASE - R800}
        r={R800}
        stroke="#b23517"
        strokeWidth="1.6"
        strokeDasharray="7 7"
        className="bore-fade"
        style={{ animationDelay: "1.2s" }}
      />
      {/* 치수 라벨(모노) */}
      <text x={circles[0].cx} y={BASE + 22} textAnchor="middle" fontSize="12" fill="#565d64" fontFamily="var(--font-mono)">Ø40</text>
      <text x={circles[4].cx} y={BASE + 22} textAnchor="middle" fontSize="12" fill="#565d64" fontFamily="var(--font-mono)">Ø100</text>
      <text x={circles[12].cx} y={BASE + 22} textAnchor="middle" fontSize="12" fill="#565d64" fontFamily="var(--font-mono)">Ø250</text>
      <text x={706} y={44} fontSize="12" fill="#565d64" fontFamily="var(--font-mono)">Ø800</text>
    </svg>
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
    // 2026-10-21 오너 '수정해줘'(전체점검-2026-10-19 SMK-01): 글 수(3건)가 아니라 「받을 수 있는 도면 파일이 1개라도 있는 글」 수.
    // 원본 CAD zip 5건이 전부 소실(missing)이라 지금은 0 → DrawingSheet 가 건수 대신 '도면 요청 → 견적요청'을 보인다.
    // 관리자가 실파일을 올리면(missing=false·storeName 있음) 자동으로 건수 표시로 돌아간다.
    prisma.post.count({
      where: { board: "cad", published: true, attachments: { some: { missing: false, storeName: { not: "" } } } },
    }),
    getContents(["slogan_en"], lang),
  ]);

  const records: RecordRow[] = history
    .filter((h) => RECORD_RE.test(h.text))
    .map((h) => ({ id: h.id, year: h.year, text: h.text, textEn: h.textEn }));

  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />

      {/* ── S1~S3 — 고정폭 본문(컨테이너 안) ── */}
      <div className="mx-auto max-w-[1280px] px-5 pb-16 md:px-8 md:pb-24">
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
            <figure>
              <BoreSpectrum />
              <figcaption className="mt-1 font-mono text-[10.5px] tracking-[0.08em] text-ink-faint">{t.heroCaption}</figcaption>
            </figure>
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
      </div>

      {/* ── S4 제작 범위 — 풀블리드 흰 시트(치수 도해 + 대형 숫자). 문구는 컴포넌트 소유 ── */}
      <RangeBand lang={lang} />

      {/* ── S5 실린더가 들어간 곳 — 풀블리드 잉크 밴드. 연혁 원문(DB)은 그대로, 조판만 바꾼다 ── */}
      <RecordBand rows={records} lang={lang} />

      {/* ── S6 도면과 카탈로그 — 자료실 두 입구를 도면 시트 한 장으로(제 컨테이너 보유) ── */}
      <DrawingSheet lang={lang} techCount={techCount} cadCount={cadCount} />

      {/* ── S7 견적 CTA + 공지 ── */}
      <div className="mx-auto max-w-[1280px] px-5 md:px-8">
        <Reveal as="section" className="mb-16 md:mb-24">
          <div className="border border-line bg-bg-raised/40 p-6 sm:p-10">
            <h2 className="text-[clamp(1.4rem,2.8vw,2rem)] font-semibold tracking-tight text-ink">{t.ctaHead}</h2>
            <p className="mt-3 text-[14.5px] text-ink-dim">{t.ctaDesc}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/support/quote"
                className="inline-flex h-11 items-center bg-red px-5 text-[14px] font-semibold text-white transition-colors hover:bg-red-live"
              >
                {t.ctaQuoteBtn}
              </Link>
              <Link
                href="/support/inquiry"
                className="inline-flex h-11 items-center border border-line px-5 text-[14px] font-medium text-ink-dim transition-colors hover:border-ink-faint hover:text-ink"
              >
                {t.ctaInquiry}
              </Link>
              <Link
                href="/company/location"
                className="inline-flex h-11 items-center border border-line px-5 text-[14px] font-medium text-ink-dim transition-colors hover:border-ink-faint hover:text-ink"
              >
                {t.ctaLocation}
              </Link>
            </div>

            {notices.length > 0 && (
              <div className="mt-10 border-t border-line pt-5">
                <div className="font-mono text-[11px] tracking-[0.14em] text-ink-faint">{t.ctaNotice}</div>
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
    </>
  );
}

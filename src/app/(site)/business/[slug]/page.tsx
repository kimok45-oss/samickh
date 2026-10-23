// 사업분야 상세 — 계열명(원문 영문 병기)·seriesCode·intro·features·기본사양 표(라이트 플레이트)·
// 원본 도식(business{n}_2·_3) + 이전/다음 계열 내비. 섹션명 = 원본 타이틀(구조 및 형식/선택 및 특수사양/기본사양).
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getLang } from "@/lib/lang";
import { pageMetadataI18n } from "@/lib/seo/metadata";
import { LegacyPlate, extractSpecTable } from "@/components/LegacyHtml";
import { Reveal } from "@/components/motion/motion-primitives";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = await prisma.series.findUnique({ where: { slug }, select: { name: true, nameEn: true, seriesCode: true } });
  if (!s) return pageMetadataI18n({ titleKo: "사업분야", titleEn: "Business", path: `/business/${slug}`, noIndex: true });
  return pageMetadataI18n({
    titleKo: `${s.name} (${s.seriesCode})`,
    titleEn: `${s.nameEn ?? s.name} (${s.seriesCode})`,
    descEn: `${s.nameEn ?? s.name} - ${s.seriesCode} series structure, options and specifications.`,
    descKo: `삼익유공압 ${s.name} — ${s.seriesCode} 시리즈 구조·특수사양·기본사양.`,
    path: `/business/${slug}`,
  });
}

function parseFeatures(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return raw.split("\n").map((s) => s.trim()).filter(Boolean);
  }
}

export default async function SeriesDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lang = await getLang();
  const s = await prisma.series.findUnique({
    where: { slug },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  if (!s || !s.published) notFound();

  const all = await prisma.series.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    select: { slug: true, name: true, nameEn: true, seriesCode: true },
  });
  const idx = all.findIndex((x) => x.slug === s.slug);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;

  const intro = lang === "en" && s.introEn ? s.introEn : s.intro;
  const features = parseFeatures(lang === "en" && s.featuresEn ? s.featuresEn : s.features);
  const specSrc = lang === "en" && s.specHtmlEn ? s.specHtmlEn : s.specHtml;
  const specTable = extractSpecTable(specSrc) ?? specSrc;
  const banner = s.images.find((i) => i.sortOrder === 0)?.path ?? null; // _1: 배너(우측 실사)
  const drawing = s.images.find((i) => i.sortOrder === 1)?.path ?? null; // _2: 외형 도면
  const chart = s.images.find((i) => i.sortOrder === 2)?.path ?? null; // _3: 장착/도식

  const L = (ko: string, en: string) => (lang === "en" ? en : ko);
  // 2026-10-22 오너 '나머지 다 진행'(1-3-3 한글 모노 라벨): 한글 소제목은 본문 글꼴·자간 없음, 영문은 예전 모노 그대로
  const h2c = lang === "en" ? "font-mono text-[13px] tracking-[0.14em] text-ink-faint" : "text-[15px] font-semibold text-ink";
  const navc = lang === "en" ? "font-mono text-[11.5px] tracking-[0.14em] text-ink-faint" : "text-[12.5px] text-ink-faint";
  const dispName = lang === "en" && s.nameEn ? s.nameEn : s.name;

  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-24 md:px-8 md:pb-32">
      {/* 헤드 */}
      <div className="flex flex-wrap items-end justify-between gap-6 pt-8">
        <div>
          {/* 2026-10-22 오너 '나머지 다 진행'(1-3-3 한글 모노 라벨): 한글 머리말은 본문 글꼴·자간 없음, 영문은 예전 그대로 */}
          <div className={lang === "ko" ? "text-[12.5px] font-medium text-ink-faint" : "font-mono text-[11px] tracking-[0.16em] text-ink-faint"}>
            <Link href="/business" className="hover:text-ink-dim">
              {L("사업분야", "BUSINESS")}
            </Link>
          </div>
          <div className="tnum mt-4 font-mono text-[clamp(1.9rem,4.4vw,3rem)] font-bold leading-none tracking-tight text-ink">
            {s.seriesCode}
          </div>
          <h1 className="mt-3 text-[clamp(1.2rem,2.4vw,1.6rem)] font-semibold text-ink">
            {lang === "en" && s.nameEn ? s.nameEn : s.name}
          </h1>
          {lang !== "en" && s.nameEn && (
            <p className="mt-1 font-mono text-[12px] tracking-[0.06em] text-ink-faint">{s.nameEn}</p>
          )}
          <p className="mt-3 inline-block border border-line px-2 py-0.5 text-[11.5px] text-ink-faint">
            {s.kind === "hydraulic" ? L("유압", "Hydraulic") : L("공압", "Pneumatic")}
          </p>
        </div>
        {/* 원본 배너 우측 실사 크롭 */}
        {banner && (
          <figure className="hidden sm:block">
            <div className="h-24 w-40 overflow-hidden border border-line bg-bg-panel">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={banner} alt={dispName} className="h-full w-full object-cover object-right" />
            </div>
          </figure>
        )}
      </div>

      {/* 구조 및 형식 — 원문 섹션명 */}
      <Reveal as="section" className="mt-14">
        <h2 className={h2c}>
          {L("구조 및 형식", "STRUCTURE & SHAPE")}
        </h2>
        <p className="mt-4 max-w-[70ch] text-[15px] leading-[1.85] text-ink-dim">{intro}</p>
        {drawing && (
          <figure className="mt-8">
            {/* 2026-10-22 오너 '나머지 다 진행'(5-1-3): 폰에서 도면이 오른쪽으로 잘리던(가로 밀기) 것을 폭에 맞춰 통째로.
                원본보다 키우지 않는다(max-w-full). 캡션의 제작 메모('원본 자산')는 뺐다(1-3-3 · SMK-10). */}
            <div className="border border-line bg-paper p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={drawing} alt={`${dispName} — ${L("외형 도면", "outline drawing")}`} className="mx-auto h-auto max-w-full" />
            </div>
            <figcaption className={lang === "en" ? "mt-2 font-mono text-[12px] text-ink-faint" : "mt-2 text-[12.5px] text-ink-faint"}>
              {L("외형 도면", "Outline drawing")}
            </figcaption>
          </figure>
        )}
      </Reveal>

      {/* 선택 및 특수사양 — 원문 섹션명 */}
      {features.length > 0 && (
        <Reveal as="section" className="mt-14">
          <h2 className={h2c}>
            {L("선택 및 특수사양", "OPTION & SPECIFICATION")}
          </h2>
          <ul className="mt-4 max-w-[70ch]">
            {features.map((f) => (
              <li key={f} className="flex gap-3 border-b border-line-soft py-2.5 text-[14px] text-ink-dim">
                <span aria-hidden className="mt-[9px] block h-1 w-1 shrink-0 bg-ink-faint" />
                {f}
              </li>
            ))}
          </ul>
        </Reveal>
      )}

      {/* 기본사양 — 원문 섹션명, 라이트 플레이트 */}
      <Reveal as="section" className="mt-14">
        <h2 className={h2c}>
          {L("기본사양", "STANDARD SPECIFICATION")}
        </h2>
        <div className="mt-4">
          <LegacyPlate html={specTable} />
        </div>
      </Reveal>

      {/* 장착/도식 — 원본 business{n}_3 */}
      {chart && (
        <Reveal as="section" className="mt-14">
          <h2 className={h2c}>{L("도식", "DIAGRAM")}</h2>
          <figure className="mt-4">
            {/* 2026-10-22(5-1-3 · 1-3-3): 폰에서 폭에 맞춰 통째로(원본보다 키우지 않음), 제작 메모 캡션 제거 */}
            <div className="border border-line bg-paper p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={chart} alt={`${dispName} — ${L("도식", "diagram")}`} className="mx-auto h-auto max-w-full" />
            </div>
          </figure>
        </Reveal>
      )}

      {/* 이전/다음 계열 */}
      <nav className="mt-16 grid gap-px border border-line bg-line sm:grid-cols-2" aria-label={L("계열 이동", "Series navigation")}>
        {prev ? (
          <Link href={`/business/${prev.slug}`} className="group min-w-0 bg-bg p-5 transition-colors hover:bg-bg-raised">
            <span className={navc}>← {L("이전 계열", "PREV")}</span>
            <span className="mt-1.5 block truncate text-[14px] text-ink-dim group-hover:text-ink">
              <span className="tnum font-mono">{prev.seriesCode}</span> · {lang === "en" && prev.nameEn ? prev.nameEn : prev.name}
            </span>
          </Link>
        ) : (
          <div className="bg-bg p-5" />
        )}
        {next ? (
          <Link href={`/business/${next.slug}`} className="group min-w-0 bg-bg p-5 text-right transition-colors hover:bg-bg-raised">
            <span className={navc}>{L("다음 계열", "NEXT")} →</span>
            <span className="mt-1.5 block truncate text-[14px] text-ink-dim group-hover:text-ink">
              <span className="tnum font-mono">{next.seriesCode}</span> · {lang === "en" && next.nameEn ? next.nameEn : next.name}
            </span>
          </Link>
        ) : (
          <div className="bg-bg p-5" />
        )}
      </nav>
    </div>
  );
}

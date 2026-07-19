// 사업분야 인덱스 — 실린더 10계열 원장(카드 그리드 금지).
import { prisma } from "@/lib/db";
import { getLang } from "@/lib/lang";
import { pageMetadataI18n } from "@/lib/seo/metadata";
import SeriesLedger from "@/components/home/SeriesLedger";

export const generateMetadata = () =>
  pageMetadataI18n({ titleKo: "사업분야", titleEn: "Business", descKo: "삼익유공압주식회사 사업분야 — 표준보급형부터 대형 램형까지 유압 8계열·공압 2계열.", descEn: "Ten cylinder series - standard, lead-switch, position control, MILL type, vehicle, telescopic, ram and pneumatic.", path: "/business" });

export default async function BusinessIndexPage() {
  const lang = await getLang();
  const series = await prisma.series.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });
  const hyd = series.filter((s) => s.kind === "hydraulic").length;
  const pneu = series.length - hyd;

  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-24 md:px-8 md:pb-32">
      <div className="pt-8">
        <div className="font-mono text-[11px] tracking-[0.16em] text-ink-faint">{lang === "ko" ? "사업분야" : "BUSINESS"}</div>
        <h1 className="mt-3 font-mono text-[clamp(1.7rem,3.4vw,2.4rem)] font-semibold tracking-tight text-ink">
          {lang === "ko" ? "실린더 10계열" : "10 Cylinder Series"}
        </h1>
        <p className="tnum mt-3 font-mono text-[12.5px] text-ink-faint">
          {lang === "ko" ? `유압 ${hyd}계열 · 공압 ${pneu}계열` : `${hyd} hydraulic · ${pneu} pneumatic`}
        </p>
      </div>

      <div className="mt-10">
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
    </div>
  );
}

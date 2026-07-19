// 주요거래업체 — DB Client 4그룹 20사. 그룹 라벨은 원문 명칭(company_img10 "SAMICK H&P 주요거래업체").
import { prisma } from "@/lib/db";
import { getLang } from "@/lib/lang";
import { pageMetadataI18n } from "@/lib/seo/metadata";
import { Reveal } from "@/components/motion/motion-primitives";

export const generateMetadata = () =>
  pageMetadataI18n({ titleKo: "주요거래업체", titleEn: "Clients", descKo: "삼익유공압주식회사 주요거래업체 — POSCO 관련·제철설비·공작기계·건설 중장비 4개 분야.", descEn: "Major clients across POSCO, steel-plant equipment, machine tools and construction equipment.", path: "/company/clients" });

// 원문 그룹 명칭 그대로(순서 포함)
const GROUPS: { key: string; ko: string; en: string }[] = [
  { key: "posco", ko: "POSCO 관련", en: "POSCO" },
  { key: "steel-plant", ko: "제철설비관련", en: "Steel Plant Equipment" },
  { key: "machine", ko: "공작기계,산업기계관련", en: "Machine Tools & Industrial Machinery" },
  { key: "construction", ko: "건설,중장비관련", en: "Construction & Heavy Equipment" },
];

export default async function ClientsPage() {
  const lang = await getLang();
  const clients = await prisma.client.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h1 className="font-mono text-[clamp(1.7rem,3.4vw,2.4rem)] font-semibold tracking-tight text-ink">
        {lang === "ko" ? "주요거래업체" : "Clients"}
      </h1>
      <p className="tnum mt-3 font-mono text-[12.5px] text-ink-faint">
        {lang === "ko" ? `4개 분야 · ${clients.length}사` : `4 fields · ${clients.length} companies`}
      </p>

      <div className="mt-10 space-y-12">
        {GROUPS.map((g) => {
          const list = clients.filter((c) => c.group === g.key);
          if (list.length === 0) return null;
          return (
            <Reveal key={g.key}>
              <h2 className="text-[16px] font-semibold text-ink sm:text-[17px]">{lang === "en" ? g.en : g.ko}</h2>
              <ul className="mt-4 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
                {list.map((c) => (
                  <li key={c.id} className="flex min-h-[74px] items-center bg-bg px-4 py-4">
                    <span className="text-[13.5px] leading-snug text-ink-dim">
                      {lang === "en" && c.nameEn ? c.nameEn : c.name}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

// 조직현황 — SiteContent org_structure("대표이사|감사|팀,팀,…")를 파싱해 CSS 트리로.
// 원문: company_img11 판독(대표이사 — 감사 / 4팀).
import { getLang } from "@/lib/lang";
import { getContent } from "@/lib/content";
import { pageMetadataI18n } from "@/lib/seo/metadata";
import { Reveal } from "@/components/motion/motion-primitives";

export const generateMetadata = () =>
  pageMetadataI18n({ titleKo: "조직현황", titleEn: "Organization", descKo: "삼익유공압주식회사 조직현황 — 대표이사·감사·4팀 체제.", descEn: "Organization of SAMICK H&P - technical sales, design engineering, production and quality management teams.", path: "/company/organization" });

// 팀명 영문(UI 라벨 번역 — DB 원문은 ko)
const TEAM_EN: Record<string, string> = {
  기술영업팀: "Technical Sales Team",
  설계기술팀: "Design Engineering Team",
  생산관리팀: "Production Control Team",
  품질관리팀: "Quality Control Team",
};

export default async function OrganizationPage() {
  const lang = await getLang();
  const raw = await getContent("org_structure", lang);
  const [ceo = "", auditor = "", teamsRaw = ""] = raw.split("|");
  const teams = teamsRaw.split(",").map((s) => s.trim()).filter(Boolean);
  const tr = (ko: string) => (lang === "en" ? TEAM_EN[ko] ?? ko : ko);
  const trTop = (ko: string) =>
    lang === "en" ? (ko === "대표이사" ? "CEO" : ko === "감사" ? "Auditor" : ko) : ko;

  return (
    <div>
      <h1 className="font-mono text-[clamp(1.7rem,3.4vw,2.4rem)] font-semibold tracking-tight text-ink">
        {lang === "ko" ? "조직현황" : "Organization"}
      </h1>
      <p className="tnum mt-3 font-mono text-[12.5px] text-ink-faint">
        {lang === "ko" ? `${teams.length}팀 체제` : `${teams.length} teams`}
      </p>

      <Reveal className="mt-14">
        <div className="mx-auto max-w-[760px]">
          {/* 대표이사 */}
          {ceo && (
            <div className="mx-auto w-fit border border-line bg-bg-panel px-10 py-4 text-center">
              <span className="text-[16px] font-semibold text-ink">{trTop(ceo)}</span>
            </div>
          )}

          {/* 세로 커넥터 + 감사(측면) */}
          {auditor && (
            <div className="relative mx-auto h-16 w-px bg-line">
              <div className="absolute left-0 top-1/2 h-px w-[72px] bg-line sm:w-[150px]" />
              <div className="absolute left-[72px] top-1/2 -translate-y-1/2 border border-line bg-bg-raised px-4 py-2.5 sm:left-[150px] sm:px-6">
                <span className="whitespace-nowrap text-[13.5px] text-ink-dim">{trTop(auditor)}</span>
              </div>
            </div>
          )}
          {!auditor && <div className="mx-auto h-16 w-px bg-line" />}

          {/* 가로 레일 + 4팀 */}
          <div className="relative">
            <div className="absolute inset-x-[12.5%] top-0 hidden h-px bg-line sm:block" />
            <ul className="grid grid-cols-2 gap-4 pt-0 sm:grid-cols-4 sm:gap-3 sm:pt-8">
              {teams.map((t) => (
                <li key={t} className="relative">
                  <span aria-hidden className="absolute -top-8 left-1/2 hidden h-8 w-px bg-line sm:block" />
                  <div className="border border-line bg-bg-raised px-3 py-4 text-center">
                    <span className="text-[13.5px] leading-snug text-ink-dim">{tr(t)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

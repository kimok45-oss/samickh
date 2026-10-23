// 회사소개 공통 레이아웃 — 섹션 서브내비(원본 IA 5메뉴).
import { getLang } from "@/lib/lang";
import SectionNav from "@/components/SectionNav";

const ITEMS = {
  ko: [
    { href: "/company/greeting", label: "인사말" },
    { href: "/company/history", label: "회사연혁" },
    { href: "/company/clients", label: "주요거래업체" },
    { href: "/company/organization", label: "조직현황" },
    { href: "/company/location", label: "찾아오시는길" },
  ],
  en: [
    { href: "/company/greeting", label: "Greeting" },
    { href: "/company/history", label: "History" },
    { href: "/company/clients", label: "Clients" },
    { href: "/company/organization", label: "Organization" },
    { href: "/company/location", label: "Location" },
  ],
};

export default async function CompanyLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <div className="mx-auto max-w-[1280px] px-5 md:px-8">
      <div className="pt-8">
        {/* 2026-10-22 오너 '나머지 다 진행'(1-3-3 한글 모노 라벨): 한글 머리말은 본문 글꼴·자간 없음, 영문은 예전 그대로 */}
        <div className={lang === "ko" ? "text-[12.5px] font-medium text-ink-faint" : "font-mono text-[11px] tracking-[0.16em] text-ink-faint"}>
          {lang === "ko" ? "회사소개" : "COMPANY"}
        </div>
        <div className="mt-3">
          <SectionNav items={ITEMS[lang]} />
        </div>
      </div>
      <div className="pb-24 pt-10 md:pb-32">{children}</div>
    </div>
  );
}

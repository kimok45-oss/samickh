// 고객지원 공통 레이아웃 — 섹션 서브내비(원본 IA: 자료 3게시판 + 문의/견적).
// FAQ는 공개 항목이 1건 이상일 때만 내비에 노출(0건이면 진입로 숨김 — BUILD-CONTRACT §콘텐츠).
import { getLang } from "@/lib/lang";
import { prisma } from "@/lib/db";
import SectionNav from "@/components/SectionNav";

export default async function SupportLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  let faqCount = 0;
  try {
    faqCount = await prisma.faq.count({ where: { published: true } });
  } catch {
    faqCount = 0;
  }

  const items =
    lang === "ko"
      ? [
          { href: "/support/resources", label: "유공압자료" },
          { href: "/support/cad", label: "DWG/DWF DATA" },
          { href: "/support/product-info", label: "PRODUCT INFORMATION" },
          { href: "/support/inquiry", label: "온라인문의" },
          { href: "/support/quote", label: "견적요청" },
          ...(faqCount > 0 ? [{ href: "/support/faq", label: "자주 묻는 질문" }] : []),
        ]
      : [
          { href: "/support/resources", label: "Resources" },
          { href: "/support/cad", label: "DWG/DWF Data" },
          { href: "/support/product-info", label: "Product Information" },
          { href: "/support/inquiry", label: "Inquiry" },
          { href: "/support/quote", label: "Quote" },
          ...(faqCount > 0 ? [{ href: "/support/faq", label: "FAQ" }] : []),
        ];

  return (
    <div className="mx-auto max-w-[1280px] px-5 md:px-8">
      <div className="pt-8">
        {/* 2026-10-22 오너 '나머지 다 진행'(1-3-3 한글 모노 라벨): 한글 머리말은 본문 글꼴·자간 없음, 영문은 예전 그대로 */}
        <div className={lang === "ko" ? "text-[12.5px] font-medium text-ink-faint" : "font-mono text-[11px] tracking-[0.16em] text-ink-faint"}>
          {lang === "ko" ? "고객지원" : "SUPPORT"}
        </div>
        <div className="mt-3">
          <SectionNav items={items} />
        </div>
      </div>
      <div className="pb-24 pt-10 md:pb-32">{children}</div>
    </div>
  );
}

// 커뮤니티(공지·업계뉴스) 공통 레이아웃 — 섹션 서브내비.
// 자유게시판/QNA는 이식 대상 아님(원문 전건 외부 홍보+PII) — 내비에 없다(계약 §콘텐츠).
import { getLang } from "@/lib/lang";
import SectionNav from "@/components/SectionNav";

export default async function NewsLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  const items =
    lang === "ko"
      ? [
          { href: "/news/notice", label: "공지사항" },
          { href: "/news/industry", label: "업계관련뉴스" },
        ]
      : [
          { href: "/news/notice", label: "Notice" },
          { href: "/news/industry", label: "Industry News" },
        ];

  return (
    <div className="mx-auto max-w-[1280px] px-5 md:px-8">
      <div className="pt-8">
        <div className="font-mono text-[11px] tracking-[0.16em] text-ink-faint">
          {lang === "ko" ? "커뮤니티" : "COMMUNITY"}
        </div>
        <div className="mt-3">
          <SectionNav items={items} />
        </div>
      </div>
      <div className="pb-24 pt-10 md:pb-32">{children}</div>
    </div>
  );
}

// 제품소개 공통 레이아웃 — 서브내비(제품 카탈로그 / 실린더 주문방법).
import { getLang } from "@/lib/lang";
import SectionNav from "@/components/SectionNav";

const ITEMS = {
  ko: [
    { href: "/products", label: "제품소개" },
    { href: "/products/order-guide", label: "실린더 주문방법" },
  ],
  en: [
    { href: "/products", label: "Products" },
    { href: "/products/order-guide", label: "How to Order" },
  ],
};

export default async function ProductsLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <div className="mx-auto max-w-[1280px] px-5 md:px-8">
      <div className="pt-8">
        {/* 2026-10-22 오너 '나머지 다 진행'(1-3-3 한글 모노 라벨): 한글 머리말은 본문 글꼴·자간 없음, 영문은 예전 그대로 */}
        <div className={lang === "ko" ? "text-[12.5px] font-medium text-ink-faint" : "font-mono text-[11px] tracking-[0.16em] text-ink-faint"}>
          {lang === "ko" ? "제품소개" : "PRODUCTS"}
        </div>
        <div className="mt-3">
          <SectionNav items={ITEMS[lang]} />
        </div>
      </div>
      <div className="pb-24 pt-10 md:pb-32">{children}</div>
    </div>
  );
}

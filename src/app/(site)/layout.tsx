// 공개면 레이아웃 — Header/Footer + 모션(subtle)·lenis. 셸(루트 layout)은 A 소유라 건드리지 않는다.
import { getLang } from "@/lib/lang";
import { getContents } from "@/lib/content";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MotionProvider from "@/components/motion/MotionProvider";
import SmoothScroll from "@/components/motion/SmoothScroll";
import HydratedFlag from "@/components/motion/HydratedFlag";
import ContactTail from "@/components/ContactTail";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  const c = await getContents(
    ["company_name", "company_name_en", "address", "tel", "fax", "email", "biz_no"],
    lang,
  );
  return (
    <MotionProvider preset="subtle">
      <SmoothScroll />
      {/* 하이드레이션 성공 신호 — 성공하면 .reveal-rescue(2.5s CSS 폴백)를 끈다 */}
      <HydratedFlag />
      <div className="flex min-h-dvh flex-col bg-bg text-ink">
        <Header lang={lang} />
        {/* .lang-fade — LangToggle의 언어 전환 페이드 대상(globals 하단 CSS) */}
        <main className="lang-fade flex-1">{children}</main>
        {/* 2026-10-22 오너 '나머지 다 진행'(5-1-1 ③): 서브 페이지 끝 문의 꼬리(홈·견적요청·온라인문의 페이지는 스스로 숨김) */}
        <ContactTail lang={lang} tel={c.tel ?? ""} />
        <Footer
          lang={lang}
          info={{
            companyName: c.company_name ?? "",
            companyNameEn: c.company_name_en ?? "",
            address: c.address ?? "",
            tel: c.tel ?? "",
            fax: c.fax ?? "",
            email: c.email ?? "",
            bizNo: c.biz_no ?? "",
          }}
        />
      </div>
    </MotionProvider>
  );
}

// 공개면 레이아웃 — Header/Footer + 모션(subtle)·lenis. 셸(루트 layout)은 A 소유라 건드리지 않는다.
import { getLang } from "@/lib/lang";
import { getContents } from "@/lib/content";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MotionProvider from "@/components/motion/MotionProvider";
import SmoothScroll from "@/components/motion/SmoothScroll";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  const c = await getContents(
    ["company_name", "company_name_en", "address", "tel", "fax", "email", "biz_no"],
    lang,
  );
  return (
    <MotionProvider preset="subtle">
      <SmoothScroll />
      <div className="flex min-h-dvh flex-col bg-bg text-ink">
        <Header lang={lang} />
        {/* .lang-fade — LangToggle의 언어 전환 페이드 대상(globals 하단 CSS) */}
        <main className="lang-fade flex-1">{children}</main>
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

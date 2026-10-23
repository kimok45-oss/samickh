// /terms — 이용약관(홈페이지 이용 일반 약관 — 표준 조문). noindex + robots 차단.
import { pageMetadataI18n } from "@/lib/seo/metadata";
import { getLang } from "@/lib/lang";
import { getContent } from "@/lib/content";

export const generateMetadata = () =>
  pageMetadataI18n({ titleKo: "이용약관", titleEn: "Terms of Use", descEn: "Terms of use of the SAMICK H&P website.", path: "/terms", noIndex: true });

export default async function TermsPage() {
  const lang = await getLang();
  const company = (await getContent("company_name", lang)) || "삼익유공압주식회사";

  const ko = (
    <>
      <h2>제1조 (목적)</h2>
      <p>
        본 약관은 {company}(이하 &ldquo;회사&rdquo;)가 운영하는 홈페이지(이하
        &ldquo;사이트&rdquo;)의 이용 조건 및 절차에 관한 사항을 규정함을 목적으로 합니다.
      </p>

      <h2>제2조 (약관의 효력과 변경)</h2>
      <p>
        본 약관은 사이트에 게시함으로써 효력이 발생하며, 회사는 합리적인 사유가 있는 경우 관계
        법령에 위배되지 않는 범위에서 약관을 변경할 수 있습니다. 변경된 약관은 사이트에 공지함으로써
        효력이 발생합니다.
      </p>

      <h2>제3조 (서비스의 내용)</h2>
      <p>
        회사는 사이트를 통해 회사 및 제품 소개, 기술자료 제공, 온라인문의·견적요청 접수 등의
        서비스를 제공합니다. 서비스는 회사의 사정에 따라 변경·중단될 수 있습니다.
      </p>

      <h2>제4조 (이용자의 의무)</h2>
      <ul>
        <li>타인의 정보를 도용하거나 허위 정보를 입력하지 않습니다.</li>
        <li>사이트의 정상적인 운영을 방해하는 행위를 하지 않습니다.</li>
        <li>회사의 사전 승낙 없이 사이트의 정보를 영리 목적으로 이용하지 않습니다.</li>
      </ul>

      <h2>제5조 (저작권)</h2>
      <p>
        사이트에 게시된 자료(제품 사양·카탈로그·이미지 등)에 대한 저작권은 회사에 있으며, 회사의
        사전 동의 없이 무단 복제·배포할 수 없습니다.
      </p>

      <h2>제6조 (면책)</h2>
      <p>
        회사는 천재지변, 통신 장애 등 불가항력으로 인해 서비스를 제공할 수 없는 경우 책임이
        면제됩니다. 사이트에 게시된 기술자료는 참고용이며, 실제 주문 사양은 별도 협의로 확정합니다.
      </p>

      <h2>제7조 (분쟁의 해결)</h2>
      <p>
        본 약관과 관련하여 분쟁이 발생한 경우 관계 법령 및 상관례에 따르며, 소송이 필요한 경우
        민사소송법상의 관할 법원에 제기합니다.
      </p>
    </>
  );

  const en = (
    <>
      <h2>Article 1 (Purpose)</h2>
      <p>
        These terms set out the conditions and procedures for using the website operated by{" "}
        {company} (the &ldquo;Company&rdquo;).
      </p>

      <h2>Article 2 (Effect and Amendment)</h2>
      <p>
        These terms take effect upon posting on the site. The Company may amend them within the
        bounds of applicable laws, and amendments take effect upon posting.
      </p>

      <h2>Article 3 (Services)</h2>
      <p>
        The site provides company and product information, technical resources, and online
        inquiry/quote services. Services may change or be discontinued at the Company&rsquo;s
        discretion.
      </p>

      <h2>Article 4 (User Obligations)</h2>
      <ul>
        <li>Do not impersonate others or enter false information.</li>
        <li>Do not interfere with the normal operation of the site.</li>
        <li>Do not use site content for commercial purposes without prior consent.</li>
      </ul>

      <h2>Article 5 (Copyright)</h2>
      <p>
        Copyright in the materials posted on the site (specifications, catalogs, images, etc.)
        belongs to the Company and may not be reproduced or distributed without prior consent.
      </p>

      <h2>Article 6 (Disclaimer)</h2>
      <p>
        The Company is exempt from liability where services cannot be provided due to force majeure.
        Technical materials on the site are for reference; final order specifications are confirmed
        through separate consultation.
      </p>

      <h2>Article 7 (Dispute Resolution)</h2>
      <p>
        Disputes are handled in accordance with applicable laws and commercial practice, with
        jurisdiction as provided by the Civil Procedure Act of Korea.
      </p>
    </>
  );

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-12 md:px-8">
      {/* 2026-10-22 오너 '나머지 다 진행'(SMK-09 · 1-3-3): 한글 제목의 고정폭(모노) 글꼴을 본문 글꼴로 */}
      <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold tracking-tight text-ink">
        {lang === "ko" ? "이용약관" : "Terms of Use"}
      </h1>
      <div className="mt-8 space-y-4 text-[14px] leading-relaxed text-ink-dim [&_h2]:mt-8 [&_h2]:text-[15px] [&_h2]:font-bold [&_h2]:text-ink [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
        {lang === "ko" ? ko : en}
      </div>
    </div>
  );
}

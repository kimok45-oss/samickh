// /support/inquiry — 온라인문의(원문은 폼 미구성 빈 페이지 → 표준 문의폼으로 구성, 계약 §8).
import { pageMetadataI18n } from "@/lib/seo/metadata";
import { getLang } from "@/lib/lang";
import { getContents } from "@/lib/content";
import { JsonLd, organizationJsonLd } from "@/lib/seo/jsonld";
import InquiryForm from "@/components/inquiry/InquiryForm";

export const generateMetadata = () =>
  pageMetadataI18n({ titleKo: "온라인문의", titleEn: "Inquiry", descKo: "삼익유공압주식회사 온라인문의 — 유압·공압 실린더 관련 문의를 접수합니다.", descEn: "Online inquiry to SAMICK H&P.", path: "/support/inquiry" });

export default async function InquiryPage() {
  const lang = await getLang();
  const c = await getContents(["tel", "fax"], lang);

  return (
    <div className="mx-auto max-w-3xl">
      <JsonLd data={organizationJsonLd()} />
      <h1 className="font-mono text-[clamp(1.7rem,3.4vw,2.4rem)] font-semibold tracking-tight text-ink">
        {lang === "ko" ? "온라인문의" : "Online Inquiry"}
      </h1>
      <p className="mt-3 text-[14px] leading-relaxed text-ink-dim">
        {lang === "ko"
          ? "유압·공압 실린더 관련 문의를 남겨 주시면 확인 후 연락드리겠습니다."
          : "Leave your inquiry about hydraulic and pneumatic cylinders and we will get back to you."}
      </p>
      {(c.tel || c.fax) && (
        <p className="tnum mt-2 font-mono text-[12.5px] text-ink-faint">
          {c.tel && `TEL ${c.tel}`}
          {c.tel && c.fax && " · "}
          {c.fax && `FAX ${c.fax}`}
        </p>
      )}
      <div className="relative mt-8">
        <InquiryForm lang={lang} />
      </div>
    </div>
  );
}

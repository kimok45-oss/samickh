// /support/faq — FAQ. 원문에 FAQ 없음(0건): 공개 항목 0건이면 "준비 중"이 아니라 **notFound()**.
// (진입로 숨김은 support/layout·GNB·sitemap이 담당 — 계약 §콘텐츠 단일 소유권)
import { notFound } from "next/navigation";
import { pageMetadataI18n } from "@/lib/seo/metadata";
import { getLang } from "@/lib/lang";
import { getPublishedFaqs } from "@/lib/board";
import FaqAccordion from "@/components/faq/FaqAccordion";

export const generateMetadata = () =>
  pageMetadataI18n({ titleKo: "자주 묻는 질문", titleEn: "FAQ", descKo: "삼익유공압주식회사 자주 묻는 질문.", descEn: "Frequently asked questions.", path: "/support/faq" });

export default async function FaqPage() {
  const faqs = await getPublishedFaqs();
  if (faqs.length === 0) notFound();

  const lang = await getLang();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-mono text-[clamp(1.7rem,3.4vw,2.4rem)] font-semibold tracking-tight text-ink">
        {lang === "ko" ? "자주 묻는 질문" : "FAQ"}
      </h1>
      <div className="mt-8">
        <FaqAccordion faqs={faqs} lang={lang} />
      </div>
    </div>
  );
}

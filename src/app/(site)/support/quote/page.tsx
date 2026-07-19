// /support/quote — 견적요청(원문 estimate.php 필드 구성 그대로).
// `?code=` 쿼리로 형번 프리필(주문방법/제품에서 진입) — 허용 문자만 통과시켜 삽입.
import { pageMetadata } from "@/lib/seo/metadata";
import { getLang } from "@/lib/lang";
import QuoteForm from "@/components/inquiry/QuoteForm";

export const metadata = pageMetadata({
  title: "견적요청",
  description: "삼익유공압주식회사 견적요청 — 형번·사양·도면을 첨부해 견적을 요청하세요.",
  path: "/support/quote",
});

/** `?code=` 정화 — 형번에 쓰이는 문자만 허용(XSS/조작 차단), 그 외는 무시 */
function safeCode(raw: string | undefined): string {
  if (!raw) return "";
  const v = raw.trim().slice(0, 60);
  return /^[A-Za-z0-9 ,.()\/×x*-]+$/.test(v) ? v : "";
}

export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const [lang, sp] = await Promise.all([getLang(), searchParams]);
  const code = safeCode(sp.code);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-mono text-[clamp(1.7rem,3.4vw,2.4rem)] font-semibold tracking-tight text-ink">
        {lang === "ko" ? "견적요청" : "Request a Quote"}
      </h1>
      <p className="mt-3 text-[14px] leading-relaxed text-ink-dim">
        {lang === "ko"
          ? "형번·사양·수량을 적어 주시면 견적을 회신드립니다. 도면(PDF·DWG·DWF)을 첨부할 수 있습니다."
          : "Provide the model code, specifications, and quantity, and we will reply with a quote. Drawings (PDF, DWG, DWF) can be attached."}
      </p>
      <div className="relative mt-8">
        <QuoteForm lang={lang} prefillCode={code} />
      </div>
    </div>
  );
}

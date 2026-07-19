// FAQ 아코디언 — <details>/<summary> 기반(JS 없이 동작). samickh 스키마(카테고리 없음) 배선판.
// 머신 다크 토큰. lang=en이면 questionEn/answerEn 우선(없으면 ko 폴백).
import type { Lang } from "@/lib/lang";

export type FaqItem = {
  id: number;
  question: string;
  questionEn?: string | null;
  answer: string;
  answerEn?: string | null;
};

export default function FaqAccordion({ faqs, lang = "ko" }: { faqs: FaqItem[]; lang?: Lang }) {
  const isEn = lang === "en";

  return (
    <ul className="border-t border-line">
      {faqs.map((f) => (
        <li key={f.id} className="border-b border-line-soft">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-baseline gap-4 py-4 sm:px-3 [&::-webkit-details-marker]:hidden">
              <span className="font-mono text-[13px] font-bold text-ink-faint">Q</span>
              <span className="flex-1 text-[15px] font-semibold text-ink">
                {(isEn && f.questionEn) || f.question}
              </span>
              <span
                className="font-mono text-[13px] text-ink-faint transition-transform group-open:rotate-90"
                aria-hidden
              >
                ›
              </span>
            </summary>
            <div className="flex gap-4 border-t border-line-soft bg-bg-raised px-3 py-4 sm:px-5">
              <span className="font-mono text-[13px] font-bold text-ink-faint">A</span>
              <p className="whitespace-pre-line text-[14px] leading-relaxed text-ink-dim">
                {(isEn && f.answerEn) || f.answer}
              </p>
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}

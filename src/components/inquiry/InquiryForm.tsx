"use client";

// 온라인문의 폼 — useActionState + 허니팟 + (서버) rate-limit·검증. 머신 다크 토큰.
// 원문 온라인문의는 "상담폼을 설정해 주세요"(미구성 빈 페이지) — 표준 문의폼으로 구성(계약 §8).
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitInquiry, type InquiryState } from "@/lib/inquiry-action";
import type { Lang } from "@/lib/lang";

const initial: InquiryState = { ok: false, message: "" };

const field =
  "w-full rounded border border-line bg-bg-raised px-4 py-3 text-[14.5px] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink-dim";
// 2026-10-22 오너 '나머지 다 진행'(1-3-3 한글 모노 라벨): 한글 칸 이름·버튼을 본문 글꼴로
const labelCls = "mb-1.5 block text-[13px] font-semibold text-ink-dim";

const T = {
  ko: {
    name: "성명",
    phone: "연락처",
    email: "이메일",
    message: "내용",
    agree: "개인정보 수집·이용(문의 응대 목적)에 동의합니다.",
    privacy: "개인정보처리방침",
    submit: "문의 보내기",
    sending: "전송 중…",
    phPhone: "000-0000-0000",
    phMessage: "문의하실 내용을 입력해 주세요.",
    contactHint: "연락처 또는 이메일 중 하나는 반드시 입력해 주세요.",
  },
  en: {
    name: "Name",
    phone: "Phone",
    email: "Email",
    message: "Message",
    agree: "I agree to the collection and use of personal information for responding to this inquiry.",
    privacy: "Privacy Policy",
    submit: "Send Inquiry",
    sending: "Sending…",
    phPhone: "000-0000-0000",
    phMessage: "Please describe your inquiry.",
    contactHint: "Please provide at least a phone number or an email address.",
  },
} as const;

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 bg-red px-8 py-3.5 text-[14.5px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

export default function InquiryForm({ lang = "ko" }: { lang?: Lang }) {
  const [state, action] = useActionState(submitInquiry, initial);
  const t = T[lang];

  if (state.ok) {
    return (
      <div role="status" className="border border-line bg-bg-raised px-6 py-14 text-center">
        <p className={lang === "ko" ? "text-[14px] font-bold text-ink-faint" : "font-mono text-[13px] font-bold uppercase tracking-[0.16em] text-ink-faint"}>
          {lang === "ko" ? "접수 완료" : "RECEIVED"}
        </p>
        <p className="mt-3 text-[15px] font-semibold text-ink">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="border border-line bg-bg-panel p-6 sm:p-8">
      <input type="hidden" name="lang" value={lang} />
      {/* 허니팟 — 화면 밖 숨김. 봇이 채우면 서버가 저장 없이 무시 */}
      <div className="absolute left-[-9999px] top-[-9999px]" aria-hidden="true">
        <label htmlFor="inq-website">Website</label>
        <input id="inq-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="inq-name">{t.name} *</label>
          <input id="inq-name" name="name" className={field} required maxLength={100} autoComplete="name" />
        </div>
        <div>
          <label className={labelCls} htmlFor="inq-phone">{t.phone}</label>
          <input id="inq-phone" name="phone" type="tel" inputMode="tel" className={field} placeholder={t.phPhone} maxLength={50} autoComplete="tel" />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls} htmlFor="inq-email">{t.email}</label>
          <input id="inq-email" name="email" type="email" className={field} placeholder="you@example.com" maxLength={200} autoComplete="email" />
          <p className="mt-1.5 text-[12px] text-ink-faint">{t.contactHint}</p>
        </div>
      </div>

      <div className="mt-5">
        <label className={labelCls} htmlFor="inq-message">{t.message} *</label>
        <textarea
          id="inq-message"
          name="message"
          rows={6}
          maxLength={5000}
          className={`${field} resize-none`}
          placeholder={t.phMessage}
          required
        />
      </div>

      <label className="mt-5 flex items-start gap-2.5 text-[13px] text-ink-dim">
        <input type="checkbox" name="agreed" required className="mt-0.5 h-4 w-4" />
        <span>
          {t.agree}{" "}
          <a href="/privacy" target="_blank" rel="noreferrer" className="font-semibold text-ink underline underline-offset-2">
            {t.privacy}
          </a>
        </span>
      </label>

      {state.message && !state.ok && (
        <p role="alert" className="mt-5 border border-line bg-bg-raised px-4 py-3 text-[13.5px] font-semibold text-ink">
          {state.message}
        </p>
      )}

      <div className="mt-7">
        <SubmitButton label={t.submit} pendingLabel={t.sending} />
      </div>
    </form>
  );
}

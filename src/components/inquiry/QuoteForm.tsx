"use client";

// 견적요청 폼 — 원문 estimate.php 필드 구성(회사명·성명·전화3·휴대폰3·주소·이메일·내용·파일첨부).
// 파일첨부 때문에 서버액션(bodySizeLimit 1MB) 대신 /api/quote 로 multipart fetch 제출.
// `?code=` 프리필: 주문방법/제품에서 넘어온 형번을 내용 상단에 삽입.
import { useState } from "react";
import type { Lang } from "@/lib/lang";

const field =
  "w-full rounded border border-line bg-bg-raised px-4 py-3 text-[14.5px] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink-dim";
const labelCls = "mb-1.5 block font-mono text-[12px] font-bold text-ink-dim";

const T = {
  ko: {
    company: "회사명",
    name: "성명",
    tel: "전화",
    mobile: "휴대폰",
    address: "주소",
    email: "이메일",
    message: "내용",
    file: "파일첨부",
    fileHint: "pdf·zip·jpg·png·gif·dwg·dwf · 최대 20MB",
    agree: "개인정보 수집·이용(견적 회신 목적)에 동의합니다.",
    privacy: "개인정보처리방침",
    submit: "견적요청 보내기",
    sending: "전송 중…",
    done: "접수 완료",
    fail: "전송에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    contactHint: "전화·휴대폰·이메일 중 하나는 반드시 입력해 주세요.",
  },
  en: {
    company: "Company",
    name: "Name",
    tel: "Tel",
    mobile: "Mobile",
    address: "Address",
    email: "Email",
    message: "Message",
    file: "Attachment",
    fileHint: "pdf, zip, jpg, png, gif, dwg, dwf · up to 20MB",
    agree: "I agree to the collection and use of personal information for the quote reply.",
    privacy: "Privacy Policy",
    submit: "Request a Quote",
    sending: "Sending…",
    done: "RECEIVED",
    fail: "Failed to send. Please try again later.",
    contactHint: "Please provide at least one of tel, mobile, or email.",
  },
} as const;

export default function QuoteForm({
  lang = "ko",
  prefillCode = "",
}: {
  lang?: Lang;
  /** `?code=` 쿼리로 넘어온 형번 — 내용 상단에 프리필(영문/숫자/기호만 서버에서 재검증) */
  prefillCode?: string;
}) {
  const t = T[lang];
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const prefill = prefillCode
    ? (lang === "ko" ? `형번: ${prefillCode}\n\n` : `Model code: ${prefillCode}\n\n`)
    : "";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setResult(null);
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        body: new FormData(e.currentTarget),
      });
      const j = (await res.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
      setResult({ ok: Boolean(j?.ok), message: j?.message || t.fail });
    } catch {
      setResult({ ok: false, message: t.fail });
    } finally {
      setPending(false);
    }
  }

  if (result?.ok) {
    return (
      <div role="status" className="border border-line bg-bg-raised px-6 py-14 text-center">
        <p className="font-mono text-[13px] font-bold uppercase tracking-[0.16em] text-ink-faint">
          {t.done}
        </p>
        <p className="mt-3 text-[15px] font-semibold text-ink">{result.message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="border border-line bg-bg-panel p-6 sm:p-8">
      {/* 허니팟 */}
      <div className="absolute left-[-9999px] top-[-9999px]" aria-hidden="true">
        <label htmlFor="qt-website">Website</label>
        <input id="qt-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="qt-company">{t.company}</label>
          <input id="qt-company" name="company" className={field} maxLength={100} autoComplete="organization" />
        </div>
        <div>
          <label className={labelCls} htmlFor="qt-name">{t.name} *</label>
          <input id="qt-name" name="name" className={field} required maxLength={100} autoComplete="name" />
        </div>
        <div>
          <label className={labelCls} htmlFor="qt-phone">{t.tel}</label>
          <input id="qt-phone" name="phone" type="tel" inputMode="tel" className={field} placeholder="000-0000-0000" maxLength={50} autoComplete="tel" />
        </div>
        <div>
          <label className={labelCls} htmlFor="qt-mobile">{t.mobile}</label>
          <input id="qt-mobile" name="mobile" type="tel" inputMode="tel" className={field} placeholder="010-0000-0000" maxLength={50} autoComplete="mobile tel" />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls} htmlFor="qt-address">{t.address}</label>
          <input id="qt-address" name="address" className={field} maxLength={300} autoComplete="street-address" />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls} htmlFor="qt-email">{t.email}</label>
          <input id="qt-email" name="email" type="email" className={field} placeholder="you@example.com" maxLength={200} autoComplete="email" />
          <p className="mt-1.5 text-[12px] text-ink-faint">{t.contactHint}</p>
        </div>
      </div>

      <div className="mt-5">
        <label className={labelCls} htmlFor="qt-message">{t.message} *</label>
        <textarea
          id="qt-message"
          name="message"
          rows={8}
          maxLength={10000}
          defaultValue={prefill}
          className={`${field} resize-none`}
          required
        />
      </div>

      <div className="mt-5">
        <label className={labelCls} htmlFor="qt-file">{t.file}</label>
        <input
          id="qt-file"
          name="file"
          type="file"
          accept=".pdf,.zip,.jpg,.jpeg,.png,.gif,.dwg,.dwf"
          className="block w-full text-[13px] text-ink-dim file:mr-3 file:cursor-pointer file:rounded file:border file:border-line file:bg-bg-raised file:px-4 file:py-2 file:font-mono file:text-[12px] file:font-bold file:text-ink-dim"
        />
        <p className="mt-1.5 text-[12px] text-ink-faint">{t.fileHint}</p>
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

      {result && !result.ok && (
        <p role="alert" className="mt-5 border border-line bg-bg-raised px-4 py-3 text-[13.5px] font-semibold text-ink">
          {result.message}
        </p>
      )}

      <div className="mt-7">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 bg-red px-8 py-3.5 font-mono text-[14px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? t.sending : t.submit}
        </button>
      </div>
    </form>
  );
}

"use client";

// 전역 오류 경계 — 클라이언트 컴포넌트(쿠키 접근 불가 → 한/영 병기).
export default function GlobalErrorBoundary({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-bg px-5 text-center text-ink">
      <p className="font-mono text-[11.5px] font-bold uppercase tracking-[0.24em] text-ink-faint">
        SAMICK H&P
      </p>
      <h1 className="mt-4 font-mono text-[clamp(2rem,6vw,3.5rem)] font-bold leading-none tracking-tight">
        ERROR
      </h1>
      <p className="mt-4 text-[15px] font-semibold text-ink-dim">
        일시적인 오류가 발생했습니다.
      </p>
      <p className="mt-1 text-[13px] text-ink-faint">A temporary error occurred.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex items-center bg-red px-6 py-3 font-mono text-[13px] font-bold text-white transition-opacity hover:opacity-90"
      >
        다시 시도 / Retry
      </button>
    </main>
  );
}

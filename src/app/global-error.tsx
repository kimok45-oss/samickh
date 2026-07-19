"use client";

// 루트 레이아웃 자체가 깨졌을 때의 최후 방어선 — 자체 <html>/<body> 렌더(전역 CSS 없이 인라인 스타일).
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#141619",
          color: "#e8eaec",
          fontFamily:
            "'IBM Plex Mono', Pretendard, -apple-system, 'Malgun Gothic', monospace, sans-serif",
          textAlign: "center",
          padding: "0 20px",
        }}
      >
        <p style={{ fontSize: 11, letterSpacing: "0.24em", color: "#7c8288", fontWeight: 700 }}>
          SAMICK H&P
        </p>
        <h1 style={{ fontSize: 48, margin: "16px 0 0", letterSpacing: "-0.02em" }}>ERROR</h1>
        <p style={{ marginTop: 16, fontSize: 15, color: "#a7adb3" }}>
          일시적인 오류가 발생했습니다. / A temporary error occurred.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: 32,
            background: "#9f1b0a",
            color: "#fff",
            border: 0,
            padding: "12px 24px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          다시 시도 / Retry
        </button>
      </body>
    </html>
  );
}

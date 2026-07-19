"use client";

import { useState } from "react";

// 주소 복사 버튼. 클라 전용(navigator.clipboard). aria-live로 "복사됨" 안내.
export function CopyButton({ text, label = "복사", okLabel = "복사됨" }: { text: string; label?: string; okLabel?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          /* 일부 비-https/구형 환경: 무시 */
        }
      }}
      aria-label={`${label}: ${text}`}
      className="inline-flex shrink-0 items-center gap-1 rounded-[4px] border px-2 py-1 text-[12px] transition-colors hover:bg-[var(--color-paper-2,#f4f5f6)]"
      style={{ borderColor: "var(--color-line,#e3e7ec)", color: "var(--color-muted,#67727c)" }}
    >
      <span aria-hidden>{done ? "✓" : "⧉"}</span>
      <span aria-live="polite">{done ? okLabel : label}</span>
    </button>
  );
}

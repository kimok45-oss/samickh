// 관리자 화면 공용 클래스 문자열 — 머신 다크 토큰(globals @theme)만 사용(임의 색 금지).
// 레드는 CTA 배경 전용(본문 텍스트 금지 — BUILD-CONTRACT §디자인).

export const ui = {
  page: "mx-auto w-full max-w-6xl px-5 py-8",
  h1: "font-mono text-xl font-bold tracking-tight text-ink",
  h2: "font-mono text-sm font-bold tracking-wide text-ink",
  panel: "rounded-lg border border-line bg-bg-raised p-5",
  label: "mb-1 block text-xs font-bold text-ink-dim",
  input:
    "w-full rounded border border-line bg-bg px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-ink-dim",
  textarea:
    "w-full rounded border border-line bg-bg px-3 py-2 text-sm leading-relaxed text-ink outline-none placeholder:text-ink-faint focus:border-ink-dim font-mono",
  select:
    "rounded border border-line bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-ink-dim",
  btn:
    "inline-flex items-center justify-center gap-1.5 rounded bg-red px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50",
  btnGhost:
    "inline-flex items-center justify-center gap-1.5 rounded border border-line px-4 py-2 text-sm font-bold text-ink-dim transition-colors hover:border-ink-dim hover:text-ink",
  btnSmall:
    "inline-flex items-center justify-center rounded border border-line px-2.5 py-1 text-xs font-bold text-ink-dim transition-colors hover:border-ink-dim hover:text-ink",
  btnSmallDanger:
    "inline-flex items-center justify-center rounded border border-line px-2.5 py-1 text-xs font-bold text-ink-dim transition-colors hover:border-red-live hover:text-ink",
  tab: (active: boolean) =>
    "inline-flex items-center rounded px-3 py-1.5 text-[13px] font-bold transition-colors " +
    (active ? "bg-bg-panel text-ink border border-line" : "text-ink-dim hover:text-ink"),
  th: "px-3 py-2 text-left text-[11.5px] font-bold uppercase tracking-wider text-ink-faint",
  td: "px-3 py-2.5 text-[13.5px] text-ink",
  chip: "inline-flex items-center rounded-full border border-line px-2 py-0.5 text-[11px] font-bold text-ink-dim",
  err: "rounded border border-line bg-bg-panel px-4 py-3 text-sm font-semibold text-ink",
};

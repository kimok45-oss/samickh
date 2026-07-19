"use client";

import { cn } from "@/lib/utils";
import { scrollToId } from "@/lib/scroll";

/**
 * sheen sweep(호버 시 빛 한 줄이 스쳐 지나감) + 미세 부양 버튼.
 * 색은 CSS 변수로 → 브랜드 비종속. href가 "#id"면 lenis 스크롤로 이동.
 * 출처: hangang119 ui/Button.tsx 를 브랜드 비종속으로 일반화.
 *
 * 색 변수(globals.append.css 또는 :root에 정의):
 *   --mk-accent / --mk-accent-fg : primary 배경/글자
 *   --mk-ink     / --mk-ink-fg   : dark 배경/글자
 *   --mk-line                    : outline 테두리
 * lucide-react 대신 화살표 SVG를 인라인 — 추가 의존성 없음.
 */
type Variant = "primary" | "outline" | "dark" | "ghost";
type Size = "md" | "lg";

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  size?: Size;
  className?: string;
  icon?: boolean;
  type?: "button" | "submit";
  disabled?: boolean;
  /** href가 "#"으로 시작하면 무시할 헤더 오프셋(px, 음수) */
  scrollOffset?: number;
};

const base =
  "group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full font-semibold tracking-tight transition-[translate,box-shadow,background-color,color,border-color] duration-[450ms] ease-[cubic-bezier(0.33,0,0.2,1)] will-change-[translate] hover:-translate-y-0.5 active:translate-y-0 disabled:pointer-events-none disabled:opacity-60";

const sizes: Record<Size, string> = {
  md: "px-6 py-3 text-[0.95rem]",
  lg: "px-7 py-4 text-base",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--mk-accent)] text-[var(--mk-accent-fg)] shadow-[0_18px_40px_-18px_var(--mk-accent)] hover:shadow-[0_24px_50px_-16px_var(--mk-accent)]",
  dark: "bg-[var(--mk-ink)] text-[var(--mk-ink-fg)] hover:opacity-90 shadow-[0_14px_36px_-18px_rgba(0,0,0,0.6)]",
  outline:
    "border border-[var(--mk-line)] bg-transparent text-[var(--mk-ink)] hover:bg-[var(--mk-ink)] hover:text-[var(--mk-ink-fg)] hover:border-[var(--mk-ink)]",
  ghost: "bg-white/10 text-white backdrop-blur hover:bg-white/20",
};

function Arrow() {
  return (
    <svg
      className="relative size-[1.1em] transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function Button({
  children,
  href,
  onClick,
  variant = "primary",
  size = "md",
  className,
  icon = true,
  type = "button",
  disabled,
  scrollOffset = -92,
}: ButtonProps) {
  const classes = cn(base, sizes[size], variants[variant], className);

  const inner = (
    <>
      {/* 호버 시 빛 한 줄이 스쳐 지나감 */}
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-full" />
      <span className="relative">{children}</span>
      {icon && <Arrow />}
    </>
  );

  if (href) {
    const isAnchor = href.startsWith("#");
    return (
      <a
        href={href}
        className={classes}
        onClick={(e) => {
          if (isAnchor) {
            e.preventDefault();
            scrollToId(href.slice(1), scrollOffset);
          }
          onClick?.();
        }}
      >
        {inner}
      </a>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled}>
      {inner}
    </button>
  );
}

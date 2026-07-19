"use client";

// 히어로 슬라이드 — 여러 실린더 사진을 크로스페이드로 순환.
// ⚠ 사진 교체: public/uploads/hero/ 에 고해상(DSLR/Envato) 사진을 넣고 page.tsx의 HERO_SLIDES 배열만 바꾼다.
// 접근성: prefers-reduced-motion이면 자동 전환 정지(첫 장 고정), 수동 점 내비 제공.
import { useEffect, useRef, useState } from "react";

export type Slide = { src: string; caption: string };

export default function HeroCarousel({ slides, interval = 4500 }: { slides: Slide[]; interval?: number }) {
  const [i, setI] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const n = slides.length;

  useEffect(() => {
    if (n <= 1) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    timer.current = setInterval(() => setI((v) => (v + 1) % n), interval);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [n, interval]);

  const go = (idx: number) => {
    setI(idx);
    if (timer.current) clearInterval(timer.current);
  };

  return (
    <figure className="relative">
      <div className="relative aspect-[5/2] overflow-hidden border border-line bg-bg-raised shadow-[0_20px_50px_-24px_rgba(20,22,25,0.35)]">
        {slides.map((s, idx) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={s.src}
            src={s.src}
            alt={s.caption}
            width={1148}
            height={460}
            loading={idx === 0 ? "eager" : "lazy"}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[900ms] ease-out ${idx === i ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        {/* 점 내비 */}
        {n > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((s, idx) => (
              <button
                key={s.src}
                type="button"
                onClick={() => go(idx)}
                aria-label={`${idx + 1}번 사진`}
                aria-current={idx === i}
                className={`h-1.5 rounded-full transition-all ${idx === i ? "w-5 bg-red-live" : "w-1.5 bg-white/70 hover:bg-white"}`}
              />
            ))}
          </div>
        )}
      </div>
      {/* 코너 크롭 마크 */}
      <span aria-hidden className="absolute -left-1.5 -top-1.5 h-4 w-4 border-l-2 border-t-2 border-red-live" />
      <span aria-hidden className="absolute -bottom-1.5 -right-1.5 h-4 w-4 border-b-2 border-r-2 border-red-live" />
      <figcaption className="mt-2 font-mono text-[10.5px] tracking-[0.08em] text-ink-faint">{slides[i]?.caption}</figcaption>
    </figure>
  );
}

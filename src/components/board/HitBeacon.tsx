"use client";

// 조회수 비콘 — 상세 페이지 마운트 시 /api/hit POST 1회.
// RSC 렌더 중 cookies().set 금지(삼진 함정) → 증가/디듀프는 라우트 핸들러가 담당.
import { useEffect } from "react";

export default function HitBeacon({ board, slug }: { board: string; slug: string }) {
  useEffect(() => {
    const payload = JSON.stringify({ board, slug });
    try {
      const blob = new Blob([payload], { type: "application/json" });
      if (navigator.sendBeacon && navigator.sendBeacon("/api/hit", blob)) return;
    } catch {
      /* sendBeacon 미지원 → fetch 폴백 */
    }
    fetch("/api/hit", {
      method: "POST",
      body: payload,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    }).catch(() => {});
  }, [board, slug]);

  return null;
}

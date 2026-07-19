"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * 방문 로그 트래커 — 공개 레이아웃에서만 마운트한다(관리자 레이아웃엔 넣지 않는다).
 * 라우트(pathname) 변경마다 /api/track 으로 비동기 비콘을 보낸다.
 *
 *  - 화면에 아무것도 렌더하지 않음(null)
 *  - 개인 식별 정보는 보내지 않는다. path·referrer·utm·width(디바이스 분류용)만 전달하고
 *    기기/브라우저/OS는 서버가 UA 헤더로 파생한다.
 *  - sendBeacon 우선, 실패/미지원 시 fetch(keepalive) 폴백
 *  - 관리자(/admin)·API(/api) 경로는 수집 제외. 전송 실패는 조용히 무시한다.
 */
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (
      !pathname ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/api")
    ) {
      return;
    }

    // UTM 파라미터 — 카톡 등 메신저 유입은 referrer가 없어 direct로 뭉개지므로
    // 공유 링크의 utm_* 쿼리를 함께 보내 서버에서 우선 분류한다. (path엔 쿼리 미포함)
    const sp = new URLSearchParams(window.location.search);
    const payload = JSON.stringify({
      path: pathname,
      referrer: document.referrer || "",
      width: window.innerWidth || 0,
      utmSource: sp.get("utm_source") || "",
      utmMedium: sp.get("utm_medium") || "",
      utmCampaign: sp.get("utm_campaign") || "",
    });

    try {
      const blob = new Blob([payload], { type: "application/json" });
      if (navigator.sendBeacon && navigator.sendBeacon("/api/track", blob)) {
        return;
      }
    } catch {
      /* sendBeacon 미지원/실패 → fetch 폴백 */
    }

    fetch("/api/track", {
      method: "POST",
      body: payload,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}

export default PageViewTracker;

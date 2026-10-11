// lib/request.ts — 클라이언트 IP 추출 단일 지점 (samickh 배선판).
// 정본: C:\Github\thefineclinic\src\lib\request.ts (clientIpFrom)
//
// 2026-10-11 오너 '1번부터'(전체점검 공통 고장 A) — IP 헤더 위조 차단.
//   이전에는 analytics.ts(ipFrom)·inquiry-action.ts(clientIp) 두 곳에 같은 변형 로직이 있었다:
//   ① TRUSTED_PROXY_HOPS 미설정 시 기본 1로 간주해 XFF 를 믿었고,
//   ② 홉 수가 체인보다 길면 맨 왼쪽 값(클라이언트가 위조 가능)으로 되돌아갔고,
//   ③ XFF 가 없으면 홉 설정과 무관하게 X-Real-IP 를 그대로 채택했다.
//   → 헤더 한 줄로 로그인 잠금(5회/10분)·문의/견적 횟수 제한·수집 제한 버킷을 무한히 바꿀 수 있었다.
//   지금은 이 파일 하나만 IP 를 계산하고, 두 이름(ipFrom·clientIp)은 여기를 가리킨다.
//
// 규칙:
//   - 신뢰 프록시 홉 수(TRUSTED_PROXY_HOPS)가 0 보다 클 때만 IP 헤더를 읽는다.
//   - nginx `$proxy_add_x_forwarded_for` 는 클라이언트가 보낸 XFF **뒤에** 자기가 본 주소를 덧붙이므로
//     신뢰 홉 수만큼 **오른쪽에서** 센 값이 진짜 클라이언트다 → parts[parts.length - hops].
//   - XFF 가 없을 때만 x-real-ip(프록시가 붙인 값) — 이것도 홉 설정이 있을 때만.
//   - 그 밖에는 어떤 헤더도 믿지 않고 "unknown".
//
// ⚠ 운영 배포 시 TRUSTED_PROXY_HOPS 를 프록시 단수에 맞춰 반드시 설정할 것(HANDOVER §2).
//   미설정(0)이면 전 방문자가 "unknown" 한 버킷을 같이 써서, 한 사람이 제한에 걸리면 모두 막힌다.
// ⚠ 이 버그는 평상시 무증상이다(정상 방문자는 XFF 를 안 보낸다) — 화면 검수로는 안 잡힌다.

import { headers } from "next/headers";

let warnedNoHops = false;

/** 요청 헤더에서 클라이언트 IP — 신뢰 프록시가 없거나 값이 없으면 "unknown". */
export function clientIpFrom(h: Headers): string {
  const hops = Number(process.env.TRUSTED_PROXY_HOPS ?? "0");
  if (hops > 0) {
    const fwd = h.get("x-forwarded-for");
    if (fwd) {
      const parts = fwd.split(",").map((s) => s.trim()).filter(Boolean);
      // 오른쪽에서 hops번째 = 가장 바깥 신뢰 프록시가 본 클라이언트 IP
      const ip = parts[parts.length - hops];
      if (ip) return ip;
    }
    // XFF 가 없을 때만 x-real-ip — 역시 신뢰 프록시가 있을 때만 읽는다.
    const real = h.get("x-real-ip")?.trim();
    if (real) return real;
  } else if (process.env.NODE_ENV === "production" && !warnedNoHops) {
    warnedNoHops = true;
    console.warn(
      "[request] TRUSTED_PROXY_HOPS 미설정 — 프록시 뒤 배포면 전 방문자가 IP 'unknown' 으로 묶여 rate-limit 버킷을 공유합니다(HANDOVER §2).",
    );
  }
  // 홉 미설정(0)이면 어떤 IP 헤더도 믿지 않는다. 맨 왼쪽 값·x-real-ip 로 가드 밖에서 되돌아가지 말 것.
  return "unknown";
}

/** 서버액션/RSC용 래퍼 — next/headers 로 현재 요청 헤더를 읽는다. */
export async function clientIp(): Promise<string> {
  return clientIpFrom(await headers());
}

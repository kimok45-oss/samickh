// 장착형식(Mounting) 10코드 라인아트 아이콘 — 원본 도식(business1_3.gif·카탈로그 p.11 ②)을
// 단순 라인아트로 재작화. 구성: 실린더 몸통 + 롯드(우측) + 형식별 지지부 형상.
// stroke=currentColor — 배치 측에서 색을 정한다.

function Base({ children }: { children?: React.ReactNode }) {
  return (
    <svg viewBox="0 0 64 36" className="h-9 w-16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.2">
      {/* 몸통 + 카바 2 + 롯드 */}
      <rect x="16" y="12" width="30" height="12" />
      <line x1="20" y1="12" x2="20" y2="24" />
      <line x1="42" y1="12" x2="42" y2="24" />
      <line x1="46" y1="18" x2="56" y2="18" strokeWidth="2.4" />
      {children}
    </svg>
  );
}

export default function MountingIcon({ code }: { code: string }) {
  switch (code) {
    case "LA": // 축직각방향 푸트형 — 양단 하부 푸트(수직 브래킷)
      return (
        <Base>
          <path d="M18 24 v5 h5" />
          <path d="M44 24 v5 h-5" />
          <line x1="12" y1="30" x2="52" y2="30" strokeDasharray="2 2" strokeWidth="0.8" />
        </Base>
      );
    case "LB": // 축방향 푸트형 — 양단 바깥으로 뻗는 푸트
      return (
        <Base>
          <path d="M16 24 h-6 v3 h8" />
          <path d="M46 24 h6 v3 h-8" />
        </Base>
      );
    case "FA": // 롯드측 직사각 플랜지형
      return (
        <Base>
          <rect x="44" y="8" width="4" height="20" />
        </Base>
      );
    case "FB": // 헤드측 직사각 플랜지형
      return (
        <Base>
          <rect x="14" y="8" width="4" height="20" />
        </Base>
      );
    case "FC": // 롯드측 정사각 플랜지형(볼트 4)
      return (
        <Base>
          <rect x="44" y="5" width="5" height="26" />
          <circle cx="46.5" cy="8.5" r="0.9" />
          <circle cx="46.5" cy="27.5" r="0.9" />
        </Base>
      );
    case "FD": // 헤드측 정사각 플랜지형(볼트 4)
      return (
        <Base>
          <rect x="13" y="5" width="5" height="26" />
          <circle cx="15.5" cy="8.5" r="0.9" />
          <circle cx="15.5" cy="27.5" r="0.9" />
        </Base>
      );
    case "CA": // 일산형 크레비스형 — 헤드측 러그 1 + 핀 구멍
      return (
        <Base>
          <path d="M16 15 h-7 a3.5 3.5 0 0 0 0 6 h7" />
          <circle cx="9.5" cy="18" r="1.6" />
        </Base>
      );
    case "CB": // 이산형 크레비스형 — 러그 2겹
      return (
        <Base>
          <path d="M16 13.5 h-7 a4.5 4.5 0 0 0 0 9 h7" />
          <path d="M16 16 h-5 a2 2 0 0 0 0 4 h5" />
          <circle cx="9.5" cy="18" r="1.6" />
        </Base>
      );
    case "TA": // 롯드측 트러니언형 — 상하 핀
      return (
        <Base>
          <line x1="43" y1="12" x2="43" y2="6" strokeWidth="2" />
          <line x1="43" y1="24" x2="43" y2="30" strokeWidth="2" />
        </Base>
      );
    case "TC": // 중간 트러니언형 — 몸통 중앙 상하 핀
      return (
        <Base>
          <line x1="31" y1="12" x2="31" y2="6" strokeWidth="2" />
          <line x1="31" y1="24" x2="31" y2="30" strokeWidth="2" />
        </Base>
      );
    default:
      return <Base />;
  }
}

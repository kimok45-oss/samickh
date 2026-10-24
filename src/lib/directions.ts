// location-map — 길찾기 딥링크 빌더 (API 키 불필요).
// 한국: 네이버·카카오가 표준. 구글은 외국인/영문 페이지 보조(국내 자동차 길찾기는 규제로 약함).
// 약도(이미지/SVG)를 클릭하면 이 URL이 새 탭으로 열리는 게 이 스킬의 핵심 동작이다.

export type Provider = "naver" | "kakao" | "google";

export type Worksite = {
  key: string; // 고유 id (탭/앵커용)
  name: string; // 표시명(본사·창원공장 등). 다국어면 호출부에서 이미 번역된 문자열을 넘긴다.
  address: string; // 전체 주소
  tel?: string;
  fax?: string;
  transit?: string; // 대중교통 안내(선택)
  lat?: number; // 좌표가 있으면 카카오/구글이 정확해진다. 없으면 주소 검색으로 폴백(정상 동작).
  lng?: number;
  naverPlaceUrl?: string; // 네이버 플레이스/지도 URL이 있으면 네이버는 이걸 최우선(길찾기·로드뷰·리뷰 다 딸려옴)
  mapImage?: string; // 약도 이미지 경로(/img/...) — image 모드
  landmarks?: { name: string; x: number; y: number }[]; // svg 모드용 랜드마크 위치(%, 0~100)
  // 2026-10-24 오너 '1,2번 진행'(네이버 길찾기): 길찾기 검색에만 쓰는 주소(화면에는 address 가 그대로 보인다).
  // 영어 화면은 영문 주소로 찾으면 네이버·구글 모두 결과가 없어, 호출부가 국문 주소를 넘긴다.
  searchAddress?: string;
};

/** 약도/버튼 클릭 시 열 길찾기 URL. 키 불필요. */
export function buildDirectionsUrl(provider: Provider, s: Worksite): string {
  const hasLatLng = typeof s.lat === "number" && typeof s.lng === "number";
  const addr = encodeURIComponent(s.searchAddress || s.address);
  switch (provider) {
    case "naver":
      // 플레이스 URL이 가장 좋다(등록돼 있으면). 없으면 주소 검색 → 주소 패널(출발·도착)과 그 주소의 장소가 뜬다.
      // 2026-10-24 오너 '1,2번 진행'(네이버 길찾기): '이름+주소'로 찾으면 네이버가 "조건에 맞는 업체가 없습니다"를
      // 띄워(실크롬 확인) 주소만으로 찾는다(케이티앤이 127e5da 와 같은 방식).
      return s.naverPlaceUrl || `https://map.naver.com/p/search/${addr}`;
    case "kakao":
      return hasLatLng
        ? `https://map.kakao.com/link/to/${encodeURIComponent(s.name)},${s.lat},${s.lng}`
        : `https://map.kakao.com/?q=${addr}`;
    case "google":
      return `https://www.google.com/maps/dir/?api=1&destination=${hasLatLng ? `${s.lat},${s.lng}` : addr}`;
  }
}

/** 로케일별 기본 제공자: 한국어=네이버+카카오, 그 외=구글(외국인 방문객). */
export function providersForLocale(locale: string): Provider[] {
  return locale.startsWith("ko") ? ["naver", "kakao"] : ["google"];
}

export const PROVIDER_LABEL: Record<Provider, { ko: string; en: string }> = {
  naver: { ko: "네이버 길찾기", en: "Naver Map" },
  kakao: { ko: "카카오맵", en: "Kakao Map" },
  google: { ko: "구글 지도", en: "Google Maps" },
};

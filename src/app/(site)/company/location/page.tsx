// 찾아오시는길 — 주소·전화·팩스는 DB(SiteContent), 약도는 원본 이미지(location-map.png).
// WorksiteMap: 약도 클릭 → 네이버/카카오 길찾기 딥링크(키 불필요). 좌표는 원문 부재 → 주소 검색 폴백.
// 2026-10-22 오너 '나머지 다 진행'(전체점검-2026-10-19 SMK-17): 이 페이지만 머리가 달랐다(영문 'LOCATION' 키커 + 다른 들여쓰기·크기의 제목).
//   → 다른 회사소개 페이지와 같은 h1 머리로 맞추고, 사업장이 1곳이라 탭 묶음(WorksiteSection) 없이 WorksiteMap 을 바로 쓴다.
//   제작 메모 캡션('약도 — 원본 홈페이지 자산')은 뺐다(1-3-3 · SMK-10). 약도는 원본 크기 이하로(WorksiteMap).
import { getLang } from "@/lib/lang";
import { getContents } from "@/lib/content";
import { pageMetadataI18n } from "@/lib/seo/metadata";
import { WorksiteMap } from "@/components/location/WorksiteMap";

export const generateMetadata = () =>
  pageMetadataI18n({ titleKo: "찾아오시는길", titleEn: "Location", descKo: "삼익유공압주식회사 오시는 길 — 대구광역시 달성군 구지면 달성2차산업단지.", descEn: "Directions to SAMICK H&P - Dalseong 2nd Industrial Complex, Guji-myeon, Dalseong-gun, Daegu, Korea.", path: "/company/location" });

export default async function LocationPage() {
  const lang = await getLang();
  const c = await getContents(["company_name", "company_name_en", "address", "tel", "fax"], lang);
  const name = lang === "en" && c.company_name_en ? c.company_name_en : (c.company_name ?? "");
  // 2026-10-24 오너 '1,2번 진행'(네이버 길찾기): 영어 화면 길찾기(구글·네이버)는 영문 주소로 찾으면 둘 다 결과가 없어
  // (실크롬 확인) DB 의 국문 주소로 찾는다. 구글은 '…산업단지 28블럭 6롯트' 꼬리가 붙으면 못 찾아서 번지(852-5)까지만 쓴다.
  // 화면에 보이는 주소는 영문 그대로.
  const koAddress = lang === "en" ? ((await getContents(["address"], "ko")).address ?? "") : "";
  const searchAddress = koAddress ? upToLotNumber(koAddress) : undefined;

  return (
    <div>
      <h1 className="text-[clamp(1.7rem,3.4vw,2.4rem)] font-semibold tracking-tight text-ink">
        {lang === "ko" ? "찾아오시는길" : "Location"}
      </h1>
      <div className="mt-10">
        <WorksiteMap
          site={{
            key: "hq",
            name,
            address: c.address ?? "",
            tel: c.tel || undefined,
            fax: c.fax || undefined,
            mapImage: "/uploads/orig/brand/location-map.png",
            searchAddress,
          }}
          locale={lang}
          mode="image"
          providers={lang === "ko" ? ["naver", "kakao"] : ["google", "naver"]}
        />
      </div>
    </div>
  );
}

/** '대구광역시 달성군 구지면 내리 852-5 달성2차산업단지 …' → '대구광역시 달성군 구지면 내리 852-5'.
 *  번지(숫자 또는 숫자-숫자) 칸까지만 남긴다. 번지 칸이 없으면 주소 그대로(도로명 '…로 39' 도 그대로 남는다). */
function upToLotNumber(address: string): string {
  const parts = address.trim().split(/\s+/);
  const i = parts.findIndex((p) => /^\d+(-\d+)?$/.test(p));
  return i >= 0 ? parts.slice(0, i + 1).join(" ") : address;
}

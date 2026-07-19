// 찾아오시는길 — 주소·전화·팩스는 DB(SiteContent), 약도는 원본 이미지(location-map.png).
// WorksiteSection: 약도 클릭 → 네이버/카카오 길찾기 딥링크(키 불필요). 좌표는 원문 부재 → 주소 검색 폴백.
import { getLang } from "@/lib/lang";
import { getContents } from "@/lib/content";
import { pageMetadataI18n } from "@/lib/seo/metadata";
import { WorksiteSection } from "@/components/location/WorksiteSection";

export const generateMetadata = () =>
  pageMetadataI18n({ titleKo: "찾아오시는길", titleEn: "Location", descKo: "삼익유공압주식회사 오시는 길 — 대구광역시 달성군 구지면 달성2차산업단지.", descEn: "Directions to SAMICK H&P - Dalseong 2nd Industrial Complex, Guji-myeon, Dalseong-gun, Daegu, Korea.", path: "/company/location" });

export default async function LocationPage() {
  const lang = await getLang();
  const c = await getContents(["company_name", "company_name_en", "address", "tel", "fax"], lang);
  const name = lang === "en" && c.company_name_en ? c.company_name_en : (c.company_name ?? "");

  return (
    <div className="-mx-5 md:-mx-8">
      {/* WorksiteSection이 자체 컨테이너(max-w·px)를 가지므로 company 레이아웃 패딩을 상쇄 */}
      <WorksiteSection
        sites={[
          {
            key: "hq",
            name,
            address: c.address ?? "",
            tel: c.tel || undefined,
            fax: c.fax || undefined,
            mapImage: "/uploads/orig/brand/location-map.png",
          },
        ]}
        locale={lang}
        mode="image"
        providers={lang === "ko" ? ["naver", "kakao"] : ["google", "naver"]}
        title={lang === "ko" ? "찾아오시는길" : "Location"}
        eyebrow="LOCATION"
      />
      <p className="mx-auto max-w-[1180px] px-5 pb-4 font-mono text-[10.5px] text-ink-faint">
        {lang === "ko" ? "약도 — 원본 홈페이지 자산" : "Map — original site asset"}
      </p>
    </div>
  );
}

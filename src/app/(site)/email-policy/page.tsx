// /email-policy — 이메일무단수집거부(정보통신망법 제50조의2 표준 고지). noindex + robots 차단.
import { pageMetadataI18n } from "@/lib/seo/metadata";
import { getLang } from "@/lib/lang";
import { getContent } from "@/lib/content";

export const generateMetadata = () =>
  pageMetadataI18n({ titleKo: "이메일무단수집거부", titleEn: "Email Collection Policy", descEn: "Rejection of unauthorized email address collection.", path: "/email-policy", noIndex: true });

export default async function EmailPolicyPage() {
  const lang = await getLang();
  const company = (await getContent("company_name", lang)) || "삼익유공압주식회사";

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-12 md:px-8">
      <h1 className="font-mono text-[clamp(1.5rem,3vw,2rem)] font-semibold tracking-tight text-ink">
        {lang === "ko" ? "이메일무단수집거부" : "No Unauthorized Email Collection"}
      </h1>
      <div className="mt-8 space-y-4 text-[14px] leading-relaxed text-ink-dim">
        {lang === "ko" ? (
          <>
            <p>
              본 웹사이트에 게시된 이메일 주소가 전자우편 수집 프로그램이나 그 밖의 기술적
              장치를 이용하여 무단으로 수집되는 것을 거부하며, 이를 위반 시 「정보통신망 이용촉진
              및 정보보호 등에 관한 법률」 제50조의2에 의하여 형사 처벌됨을 유념하시기 바랍니다.
            </p>
            <p>{company}</p>
          </>
        ) : (
          <>
            <p>
              We refuse the unauthorized collection of email addresses posted on this website by
              email-harvesting programs or other technical means. Violations are subject to criminal
              punishment under Article 50-2 of the Act on Promotion of Information and
              Communications Network Utilization and Information Protection of Korea.
            </p>
            <p>{company}</p>
          </>
        )}
      </div>
    </div>
  );
}

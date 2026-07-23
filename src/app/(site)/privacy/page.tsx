// /privacy — 개인정보처리방침. 표준 조문 틀 + 보호책임자/시행일은 SiteContent(빈 값 → "[회사 확인 후 기재]").
// noindex + robots.ts 차단(계약 §SEO). 수집 항목은 이 사이트의 실제 폼(문의/견적) 기준으로만 기술.
import { pageMetadataI18n } from "@/lib/seo/metadata";
import { getLang } from "@/lib/lang";
import { getContents } from "@/lib/content";

export const generateMetadata = () =>
  pageMetadataI18n({ titleKo: "개인정보처리방침", titleEn: "Privacy Policy", descEn: "Privacy policy of SAMICK H&P.", path: "/privacy", noIndex: true });

export default async function PrivacyPage() {
  const lang = await getLang();
  const c = await getContents(["company_name", "privacy_officer", "privacy_date", "tel", "fax"], lang);
  const company = c.company_name || "삼익유공압주식회사";
  // 회사 확인 필요값: 비면 화면에 플레이스홀더를 노출하지 않고 해당 줄 자체를 숨긴다.
  const officer = c.privacy_officer || "";
  const effective = c.privacy_date || "";

  const ko = (
    <>
      <p>
        {company}(이하 &ldquo;회사&rdquo;)는 「개인정보 보호법」 등 관계 법령을 준수하며, 이용자의
        개인정보를 아래와 같이 처리합니다.
      </p>

      <h2>1. 수집하는 개인정보 항목 및 수집 방법</h2>
      <ul>
        <li>온라인문의: 성명, 연락처, 이메일, 문의 내용</li>
        <li>견적요청: 회사명, 성명, 전화, 휴대폰, 주소, 이메일, 요청 내용, 첨부파일(도면 등)</li>
        <li>수집 방법: 홈페이지 문의/견적 폼을 통한 이용자의 직접 입력</li>
      </ul>

      <h2>2. 개인정보의 수집·이용 목적</h2>
      <ul>
        <li>문의 및 견적 요청에 대한 확인·상담·회신</li>
        <li>서비스 관련 안내 및 기록 보존</li>
      </ul>

      <h2>3. 개인정보의 보유 및 이용 기간</h2>
      <p>
        수집된 개인정보는 목적 달성(문의·견적 처리 완료) 후 지체 없이 파기합니다. 다만 관계
        법령에 따라 보존할 필요가 있는 경우 해당 법령이 정한 기간 동안 보관합니다.
      </p>

      <h2>4. 개인정보의 제3자 제공</h2>
      <p>
        회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만 이용자가 사전에
        동의한 경우, 법령의 규정에 의한 경우는 예외로 합니다.
      </p>

      <h2>5. 개인정보의 파기 절차 및 방법</h2>
      <p>
        전자적 파일 형태의 정보는 복구할 수 없는 방법으로 영구 삭제하며, 종이 문서는 분쇄
        또는 소각하여 파기합니다.
      </p>

      <h2>6. 이용자의 권리</h2>
      <p>
        이용자는 언제든지 자신의 개인정보에 대한 열람·정정·삭제·처리정지를 요구할 수 있습니다.
        요청은 아래 연락처로 하실 수 있으며, 회사는 지체 없이 조치합니다.
      </p>

      <h2>7. 자동 수집 장치에 관한 사항</h2>
      <p>
        본 사이트는 방문 통계를 위해 개인을 식별하지 않는 익명 방문 기록(방문 경로·기기
        구분)만을 수집하며, 광고·추적 목적의 쿠키나 외부 분석 도구는 사용하지 않습니다. 게시물
        조회수 중복 방지 및 언어 설정을 위한 기능성 쿠키가 사용됩니다.
      </p>

      <h2>8. 개인정보 보호책임자</h2>
      <ul>
        {officer && <li>개인정보 보호책임자: {officer}</li>}
        {c.tel && <li>전화: {c.tel}</li>}
        {c.fax && <li>팩스: {c.fax}</li>}
      </ul>

      <h2>9. 고지의 의무</h2>
      <p>
        본 방침의 내용 추가·삭제·수정이 있을 경우 시행 전에 홈페이지를 통해 공지합니다.
      </p>

      {effective && <p className="policy-date">시행일: {effective}</p>}
    </>
  );

  const en = (
    <>
      <p>
        {company} (the &ldquo;Company&rdquo;) complies with the Personal Information Protection Act
        of Korea and processes personal information as described below.
      </p>

      <h2>1. Items Collected and Collection Method</h2>
      <ul>
        <li>Online inquiry: name, phone, email, message</li>
        <li>Quote request: company, name, tel, mobile, address, email, message, attachment (drawings, etc.)</li>
        <li>Method: entered directly by the user via the website forms</li>
      </ul>

      <h2>2. Purpose of Collection and Use</h2>
      <ul>
        <li>Confirming and responding to inquiries and quote requests</li>
        <li>Service guidance and record keeping</li>
      </ul>

      <h2>3. Retention Period</h2>
      <p>
        Personal information is destroyed without delay once the purpose is fulfilled, except where
        retention is required by applicable laws.
      </p>

      <h2>4. Provision to Third Parties</h2>
      <p>
        The Company does not provide personal information to third parties, except with prior
        consent or as required by law.
      </p>

      <h2>5. Destruction Procedure</h2>
      <p>
        Electronic files are permanently deleted using irreversible methods; paper documents are
        shredded or incinerated.
      </p>

      <h2>6. User Rights</h2>
      <p>
        Users may request access, correction, deletion, or suspension of processing of their
        personal information at any time using the contact below.
      </p>

      <h2>7. Automatic Collection</h2>
      <p>
        This site collects only anonymous, non-identifying visit statistics (path, device type) and
        does not use advertising or tracking cookies or external analytics tools. Functional cookies
        are used for language preference and view-count deduplication.
      </p>

      <h2>8. Privacy Officer</h2>
      <ul>
        {officer && <li>Privacy Officer: {officer}</li>}
        {c.tel && <li>Tel: {c.tel}</li>}
        {c.fax && <li>Fax: {c.fax}</li>}
      </ul>

      <h2>9. Notification</h2>
      <p>Changes to this policy will be announced on this website before taking effect.</p>

      {effective && <p className="policy-date">Effective date: {effective}</p>}
    </>
  );

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-12 md:px-8">
      <h1 className="font-mono text-[clamp(1.5rem,3vw,2rem)] font-semibold tracking-tight text-ink">
        {lang === "ko" ? "개인정보처리방침" : "Privacy Policy"}
      </h1>
      <div className="policy-body mt-8 space-y-4 text-[14px] leading-relaxed text-ink-dim [&_h2]:mt-8 [&_h2]:font-mono [&_h2]:text-[14px] [&_h2]:font-bold [&_h2]:text-ink [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_.policy-date]:mt-10 [&_.policy-date]:font-mono [&_.policy-date]:text-[13px] [&_.policy-date]:text-ink-faint">
        {lang === "ko" ? ko : en}
      </div>
    </div>
  );
}

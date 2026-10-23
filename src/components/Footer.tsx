// 공개면 푸터 — 회사명·주소·전화·팩스는 DB(SiteContent)에서 (site)/layout이 조회해 props로 내려준다.
// 이메일·사업자번호는 빈 문자열이면 렌더 생략([확인필요] 값 — 날조 금지).
import Link from "next/link";
import type { Lang } from "@/lib/lang";
import { telHref } from "@/lib/tel";

export type FooterInfo = {
  companyName: string;
  companyNameEn: string;
  address: string;
  tel: string;
  fax: string;
  email: string;
  bizNo: string;
};

const LINK_COLS: { ko: string; en: string; items: { href: string; ko: string; en: string }[] }[] = [
  {
    ko: "회사소개",
    en: "Company",
    items: [
      { href: "/company/greeting", ko: "인사말", en: "Greeting" },
      { href: "/company/history", ko: "회사연혁", en: "History" },
      { href: "/company/location", ko: "찾아오시는길", en: "Location" },
    ],
  },
  {
    ko: "제품",
    en: "Products",
    items: [
      { href: "/business", ko: "사업분야", en: "Business" },
      { href: "/products", ko: "제품소개", en: "Products" },
      { href: "/products/order-guide", ko: "실린더 주문방법", en: "How to Order" },
    ],
  },
  {
    ko: "고객지원",
    en: "Support",
    items: [
      { href: "/support/resources", ko: "유공압자료", en: "Technical Data" },
      { href: "/support/cad", ko: "DWG/DWF DATA", en: "DWG/DWF Data" },
      { href: "/support/quote", ko: "견적요청", en: "Request a Quote" },
    ],
  },
];

export default function Footer({ lang, info }: { lang: Lang; info: FooterInfo }) {
  return (
    <footer className="border-t border-line bg-bg-raised">
      <div className="mx-auto max-w-[1280px] px-5 py-14 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
          {/* 좌: 회사 정보 */}
          <div>
            {/* 원본 CI 로고 이식 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/uploads/orig/brand/logo.png"
              alt={lang === "ko" ? "삼익유공압주식회사 SAMICK H&P" : "SAMICK H&P"}
              width={231}
              height={47}
              className="h-10 w-auto"
            />
            <div className="mt-3 text-[13px] text-ink-dim">
              {lang === "en" && info.companyNameEn ? info.companyNameEn : info.companyName}
            </div>
            <dl className="mt-5 space-y-1.5 text-[13px] leading-relaxed text-ink-faint">
              {info.address && (
                <div className="flex gap-3">
                  <dt className="shrink-0">{lang === "ko" ? "주소" : "Address"}</dt>
                  <dd>{info.address}</dd>
                </div>
              )}
              {info.tel && (
                <div className="flex gap-3">
                  <dt className="shrink-0">{lang === "ko" ? "전화" : "Tel"}</dt>
                  <dd className="tnum">
                    {/* 2026-10-22 오너 '나머지 다 진행'(5-1-1 ①): 전화 링크를 공용 telHref 로(범위 표기 "~2" 앞 대표 번호만) */}
                    <a href={telHref(info.tel)} className="hover:text-ink-dim">
                      {info.tel}
                    </a>
                  </dd>
                </div>
              )}
              {info.fax && (
                <div className="flex gap-3">
                  <dt className="shrink-0">{lang === "ko" ? "팩스" : "Fax"}</dt>
                  <dd className="tnum">{info.fax}</dd>
                </div>
              )}
              {/* 아래 두 항목은 원문 부재([확인필요]) — 값이 채워지기 전까지 렌더 생략 */}
              {info.email && (
                <div className="flex gap-3">
                  <dt className="shrink-0">{lang === "ko" ? "이메일" : "Email"}</dt>
                  <dd>
                    <a href={`mailto:${info.email}`} className="hover:text-ink-dim">
                      {info.email}
                    </a>
                  </dd>
                </div>
              )}
              {info.bizNo && (
                <div className="flex gap-3">
                  <dt className="shrink-0">{lang === "ko" ? "사업자등록번호" : "Business Reg. No."}</dt>
                  <dd className="tnum">{info.bizNo}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* 우: 링크 컬럼 */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {LINK_COLS.map((col) => (
              <div key={col.ko}>
                <div className="text-[12px] font-medium tracking-[0.1em] text-ink-faint">
                  {lang === "ko" ? col.ko : col.en}
                </div>
                <ul className="mt-3 space-y-2">
                  {col.items.map((it) => (
                    <li key={it.href}>
                      <Link href={it.href} className="text-[13px] text-ink-dim transition-colors hover:text-ink">
                        {lang === "ko" ? it.ko : it.en}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] tracking-[0.08em] text-ink-faint">COPYRIGHT SAMICK H&amp;P. ALL RIGHTS RESERVED.</p>
          <ul className="flex gap-5 text-[12px] text-ink-faint">
            <li>
              <Link href="/privacy" className="hover:text-ink-dim">
                {lang === "ko" ? "개인정보처리방침" : "Privacy Policy"}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-ink-dim">
                {lang === "ko" ? "이용약관" : "Terms of Use"}
              </Link>
            </li>
            <li>
              <Link href="/email-policy" className="hover:text-ink-dim">
                {lang === "ko" ? "이메일무단수집거부" : "Email Policy"}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
